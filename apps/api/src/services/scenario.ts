import { NetworkDesignModel, ScenarioModel, IScenario } from '../models';
import { AppError } from '../utils/errors';

export interface CreateScenarioInput {
  designId: string;
  name: string;
  description?: string;
  failedLinkId: string;
  affectedNetworks: string[];
  expectedBehavior: string;
  observedBehavior?: string;
  isEducationalSimulation?: boolean;
}

export const scenarioService = {
  async create(input: CreateScenarioInput): Promise<IScenario> {
    if (!input.designId.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }

    const design = await NetworkDesignModel.findById(input.designId).lean().exec();
    if (!design) throw AppError.notFound('Design not found');
    if (!design.links.some((link) => link.linkId === input.failedLinkId)) throw AppError.validation('Failed link does not belong to this design');
    const scenario = new ScenarioModel({
      ...input,
      isEducationalSimulation: input.isEducationalSimulation ?? true,
    });

    return scenario.save();
  },

  async findById(id: string): Promise<IScenario | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid scenario ID format');
    }
    return ScenarioModel.findById(id).lean<IScenario>().exec();
  },

  async findByDesignId(designId: string): Promise<IScenario[]> {
    if (!designId.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }
    return ScenarioModel.find({ designId }).sort({ createdAt: -1 }).lean<IScenario[]>().exec();
  },

  async update(id: string, input: Partial<CreateScenarioInput>): Promise<IScenario | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid scenario ID format');
    }
    if (input.failedLinkId) {
      const scenario = await this.findById(id);
      if (!scenario) return null;
      const design = await NetworkDesignModel.findById(scenario.designId).lean().exec();
      if (!design?.links.some((link) => link.linkId === input.failedLinkId)) throw AppError.validation('Failed link does not belong to this design');
    }
    return ScenarioModel.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean<IScenario>().exec();
  },

  async delete(id: string): Promise<boolean> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid scenario ID format');
    }
    const result = await ScenarioModel.findByIdAndDelete(id);
    return result !== null;
  },
};
