import { Model } from 'mongoose';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

export interface IBaseService<M> {
  model: Model<M>;

  create(createDto: Params, activeUser?: ActiveUserData): Promise<M>;

  createIfUnique(
    conditions: Params,
    dto: Params,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  findAll(
    conditions: Params,
    pagination: Pagination,
  ): Promise<{ elements: M[]; pagination: PaginationResult }>;

  findAllWithoutPagination(
    conditions: Params,
  ): Promise<{ elements: M[]; total: number }>;

  findAllAggregate(
    conditions: Params[],
    pagination: Pagination,
  ): Promise<{ elements: M[]; pagination: PaginationResult }>;

  findById(id: string): Promise<M>;

  findOne(conditions: Params): Promise<M>;

  exists(conditions: Params): Promise<boolean>;

  update(
    id: string,
    updateDto: Params,
    options: CustomUpdateOptions,
    activeUser?: ActiveUserData,
  ): Promise<M>;

  updateMany(
    ids: string[],
    conditions: Params,
    options: CustomUpdateOptions,
    activeUser?: ActiveUserData,
  ): Promise<any>;

  remove(id: string, activeUser?: ActiveUserData): Promise<any>;

  removeMany(ids: string[], activeUser?: ActiveUserData): Promise<any>;

  restore(id: string, activeUser?: ActiveUserData): Promise<any>;

  restoreMany(ids: string[], activeUser?: ActiveUserData): Promise<any>;

  count(conditions?: Params): Promise<number>;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  totalElements: number;
  hasNextPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
}

export interface Params {
  [key: string]: any;
}

export interface CustomUpdateOptions {
  new: boolean;
}

export const DEFAULT_PAGINATION: Pagination = { page: 1, limit: 10 };
