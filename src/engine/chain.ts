import {isEmpty} from "lodash";
import {Choices, IEngine, nextChoices, Unit} from "./common";


export interface IContext<U extends Unit<U>> {
    engine: IEngine<U>;
}

export interface StepInfo {
    choiceText?: string;
    choiceOptions?: any;
}

export interface Step<S extends StepInfo, U extends Unit<U>> {
    stepInfo?: S;
    build: () => Promise<U | null>;
}

export type StepRender<S extends StepInfo, U extends Unit<U>> = (nextStep: Step<S, U>) => Promise<U>;

export interface StepConfig<S extends StepInfo, U extends Unit<U>> {
    getStepInfo?: () => S;
    render: StepRender<S, U>;
}

export type StepProvider<S extends StepInfo, U extends Unit<U>> = (context: IContext<U>) => StepConfig<S, U>;

export type PostStepBuilder<S extends StepInfo, U extends Unit<U>> =
    (step: Step<S, U>, config: StepConfig<S, U>, provider: StepProvider<S, U>) => void;

export class Chain<S extends StepInfo, U extends Unit<U>> {
    context: IContext<U>;
    providers: StepProvider<S, U>[];
    exitStepProvider: StepProvider<S, U>;
    isRuntime: boolean;
    postStepBuilder: PostStepBuilder<S, U>;

    constructor(context: IContext<U>, exitStepProvider: StepProvider<S, U>, postStepBuilder: PostStepBuilder<S, U>) {
        this.context = context;
        this.providers = [];
        this.exitStepProvider = exitStepProvider;
        this.isRuntime = false;
        this.postStepBuilder = postStepBuilder;
    }

    // This should be called before calling nextStep
    addStepProviders(...providers: StepProvider<S, U>[]) {
        if (!this.isRuntime) {
            this.providers.push(...providers);
        }
        throw new Error("You can not use it in runtime");
    }

    nextStep(): Step<S, U> | null {
        if (!this.isRuntime) {
            this.isRuntime = true;
            this.providers.push(this.exitStepProvider);
        }
        if (isEmpty(this.providers)) {
            return null;
        }
        const provider = this.providers.shift();
        if (!provider) {
            return null;
        }
        const stepConfig: StepConfig<S, U> = provider.apply(this, [this.context]);
        if (stepConfig) {
            const step: Step<S, U> = {
                stepInfo: stepConfig.getStepInfo && stepConfig.getStepInfo(),
                build: async () => {
                    let realStep: Step<S, U> | null = null;
                    const target: Step<S, U> = {build: async () => null};
                    const lazy = new Proxy(target, {
                       get: (_obj, prop) => {
                           if (!realStep) {
                               realStep = this.nextStep();
                           }
                           if (!realStep) {
                               throw new Error("The next step is null");
                           }
                           return realStep[prop];
                       }
                    });

                    return stepConfig.render(lazy);
                }
            };
            if (this.postStepBuilder) {
                this.postStepBuilder(step, stepConfig, provider);
            }
            return step;
        }
        return this.nextStep();
    }
}

export function getChoicesFromNextStep<U extends Unit<U>>(nextStep: Step<any, U>): Choices<U> {
    return  nextChoices({
        text: nextStep.stepInfo.choiceText,
        options: nextStep.stepInfo.choiceOptions,
        callback: nextStep.build
    });
}