import mongoose, { Document, Schema } from 'mongoose';

export interface IScenario extends Document {
  designId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  failedLinkId: string;
  affectedNetworks: string[];
  expectedBehavior: string;
  observedBehavior?: string;
  isEducationalSimulation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scenarioSchema = new Schema<IScenario>(
  {
    designId: { type: Schema.Types.ObjectId, ref: 'NetworkDesign', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    failedLinkId: { type: String, required: true },
    affectedNetworks: [{ type: String, required: true }],
    expectedBehavior: { type: String, required: true, trim: true },
    observedBehavior: { type: String, trim: true },
    isEducationalSimulation: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

scenarioSchema.index({ designId: 1, createdAt: -1 });

export const ScenarioModel = mongoose.model<IScenario>('Scenario', scenarioSchema);