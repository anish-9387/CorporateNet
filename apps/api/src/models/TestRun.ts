import mongoose, { Document, Schema } from 'mongoose';
import { NetworkDesignModel } from './NetworkDesign';

export type TestStatus = 'passed' | 'failed' | 'not-run' | 'not-applicable';
export type EvidenceType = 'packet-tracer-cli' | 'packet-tracer-ping' | 'manual' | 'simulated';

export interface ITestRun extends Document {
  designId: mongoose.Types.ObjectId;
  testType: string;
  source: string;
  destination: string;
  status: TestStatus;
  observedOutput?: string;
  evidenceType: EvidenceType;
  notes?: string;
  testedAt: Date;
}

const testRunSchema = new Schema<ITestRun>(
  {
    designId: { type: Schema.Types.ObjectId, ref: 'NetworkDesign', required: true, index: true },
    testType: { type: String, required: true, trim: true, maxlength: 50 },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    status: { type: String, enum: ['passed', 'failed', 'not-run', 'not-applicable'], required: true },
    observedOutput: { type: String },
    evidenceType: { type: String, enum: ['packet-tracer-cli', 'packet-tracer-ping', 'manual', 'simulated'], required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    testedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

testRunSchema.index({ designId: 1, testedAt: -1 });
testRunSchema.index({ designId: 1, testType: 1 });

export const TestRunModel = mongoose.model<ITestRun>('TestRun', testRunSchema);