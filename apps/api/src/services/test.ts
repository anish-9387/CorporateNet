import { TestRunModel, ITestRun, TestStatus, EvidenceType } from '../models';
import { AppError } from '../utils/errors';

export interface CreateTestInput {
  designId: string;
  testType: string;
  source: string;
  destination: string;
  status: TestStatus;
  observedOutput?: string;
  evidenceType: EvidenceType;
  notes?: string;
  testedAt?: Date;
}

export interface TestFilters {
  designId?: string;
  testType?: string;
  status?: TestStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export const testService = {
  async create(input: CreateTestInput): Promise<ITestRun> {
    if (!input.designId.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }

    const test = new TestRunModel({
      ...input,
      testedAt: input.testedAt ?? new Date(),
    });

    return test.save();
  },

  async findById(id: string): Promise<ITestRun | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid test ID format');
    }
    return TestRunModel.findById(id).lean<ITestRun>().exec();
  },

  async findAll(filters: TestFilters = {}): Promise<{ tests: ITestRun[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filters.designId) {
      if (!filters.designId.match(/^[0-9a-fA-F]{24}$/)) {
        throw AppError.badRequest('Invalid design ID format');
      }
      query.designId = filters.designId;
    }
    if (filters.testType) query.testType = filters.testType;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.testedAt = {};
      if (filters.startDate) (query.testedAt as Record<string, Date>).$gte = filters.startDate;
      if (filters.endDate) (query.testedAt as Record<string, Date>).$lte = filters.endDate;
    }

    const limit = Math.min(filters.limit ?? 50, 100);
    const offset = filters.offset ?? 0;

    const [tests, total] = await Promise.all([
      TestRunModel.find(query).sort({ testedAt: -1 }).skip(offset).limit(limit).lean<ITestRun[]>().exec(),
      TestRunModel.countDocuments(query),
    ]);

    return { tests, total };
  },

  async update(id: string, input: Partial<CreateTestInput>): Promise<ITestRun | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid test ID format');
    }
    return TestRunModel.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean<ITestRun>().exec();
  },

  async delete(id: string): Promise<boolean> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid test ID format');
    }
    const result = await TestRunModel.findByIdAndDelete(id);
    return result !== null;
  },

  async getConnectivityMatrix(designId: string): Promise<Record<string, Record<string, TestStatus>>> {
    const { tests } = await this.findAll({ designId, limit: 1000 });
    const matrix: Record<string, Record<string, TestStatus>> = {};

    for (const test of tests) {
      if (!matrix[test.source]) matrix[test.source] = {};
      if (!matrix[test.destination]) matrix[test.destination] = {};
      (matrix[test.source] as Record<string, TestStatus>)[test.destination] = test.status;
      (matrix[test.destination] as Record<string, TestStatus>)[test.source] = test.status;
    }

    return matrix;
  },
};