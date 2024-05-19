import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import {
  CustomUpdateOptions,
  IBaseService,
  Pagination,
  PaginationResult,
  Params,
} from './base-interfaces';

export function BaseService<M>(
  modelClass: string | any,
): Type<IBaseService<M>> {
  @Injectable()
  class BaseServiceClass implements IBaseService<M> {
    private readonly logger = new Logger(BaseServiceClass.name);
    @InjectModel(modelClass) public model: Model<M | any>;

    public async create(
      createDto: Params,
      activeUser?: ActiveUserData,
    ): Promise<M> {
      try {
        return activeUser
          ? await this.model.create({ ...createDto, createdBy: activeUser.sub })
          : await this.model.create(createDto);
      } catch (err) {
        if (err.code === 11000) {
          this.logger.error(err);
          throw new ConflictException('Document already exists');
        }
        this.logger.error(err);
        throw err;
      }
    }

    public async createIfUnique(
      conditions: Params,
      createDto: Params,
      activeUser?: ActiveUserData,
    ): Promise<M> {
      try {
        const exists = await this.exists(conditions);
        if (exists) {
          throw new BadRequestException('Document already exists');
        }
        return activeUser
          ? await this.model.create({ ...createDto, createdBy: activeUser.sub })
          : await this.model.create(createDto);
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async findAll(
      conditions: Params = {},
      pagination: Pagination = { page: 1, limit: 10 },
    ): Promise<{ elements: M[]; pagination: PaginationResult }> {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skipCount = (page - 1) * limit;
        const order = conditions['order'] || '-createdAt';
        const select = conditions['select'] || '';
        const populate = conditions['populate'] || [];
        const collation = conditions['collation'] || {};

        const where: Params = { ...conditions, deleted: false };
        delete where.order;
        delete where.populate;
        delete where.select;
        delete where.collation;

        let query = this.model
          .find(where)
          .skip(skipCount)
          .limit(limit)
          .sort(order)
          .collation(collation)
          .select(select);

        if (populate.length) {
          query = query.populate(populate);
        }

        const [elements, total] = await Promise.all([
          query.exec(),
          this.model.countDocuments(where),
        ]);

        const hasNextPage = total > page * limit;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;
        const lastPage = Math.ceil(total / limit);

        const paginationResult: PaginationResult = {
          totalElements: total,
          hasNextPage,
          nextPage,
          previousPage,
          lastPage,
        };

        return {
          elements,
          pagination: paginationResult,
        };
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async findAllWithoutPagination(
      conditions: Params = {},
    ): Promise<{ elements: M[]; total: number }> {
      try {
        const order = conditions['order'] || '-createdAt';
        const populate = conditions['populate'] || [];
        const select = conditions['select'] || '';

        const where: Params = { ...conditions, deleted: false };
        delete where.order;
        delete where.populate;
        delete where.select;
        let query = this.model.find(where).sort(order).select(select);

        if (populate.length) {
          query = query.populate(populate);
        }

        const elements = await query.exec();
        const total = elements.length;

        return {
          elements,
          total,
        };
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async findAllAggregate(
      pipeline = [],
      pagination: Pagination = { page: 1, limit: 10 },
    ): Promise<{ elements: M[]; pagination: PaginationResult }> {
      try {
        const order = pipeline['order'] || '-createdAt';
        const { page = 1, limit = 10 } = pagination;
        const skipCount = (page - 1) * limit;

        const where: Params = { deleted: false };
        delete where.order;
        pipeline.unshift({ $match: where });

        const totalQuery = [...pipeline];
        totalQuery.push({ $count: 'total' });

        const query = this.model.aggregate(pipeline).sort(order);

        const [elements, total] = await Promise.all([
          query.skip(skipCount).limit(limit).exec(),
          this.model.aggregate(totalQuery).exec(),
        ]);

        const totalDocuments = total.length > 0 ? total[0].total : 0;

        const hasNextPage = totalDocuments > page * limit;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;
        const lastPage = Math.ceil(totalDocuments / limit);

        const paginationResult: PaginationResult = {
          totalElements: totalDocuments,
          hasNextPage,
          nextPage,
          previousPage,
          lastPage,
        };

        return {
          elements,
          pagination: paginationResult,
        };
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async findById(id: string): Promise<M> {
      try {
        const data = await this.model.findById(id);
        if (!data)
          throw new NotFoundException(
            `Not found ${this.model.name} with id ${id}`,
          );
        return data;
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    public async findOne(conditions: Params): Promise<M> {
      try {
        const where: Params = { ...conditions, deleted: false };
        const populate = where.populate || [];
        const select = conditions['select'] || '';
        delete where.populate;
        delete where.select;

        let element = this.model.findOne(where);

        if (populate.length) {
          element = element.populate(populate);
        }
        if (select !== '') {
          element = element.select(select);
        }

        const response = await element;

        if (!response) {
          const { deleted, ...updatedWhere } = where;
          throw new NotFoundException(
            `Not found ${this.model.name} with params ${JSON.stringify(
              updatedWhere,
            )}`,
          );
        }

        return response;
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }

    public async exists(conditions: Params): Promise<boolean> {
      try {
        const where: Params = { ...conditions, deleted: false };
        const exists = await this.model.exists(where);
        return !!exists;
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async update(
      id: string,
      updateDto: Params,
      options: CustomUpdateOptions,
      activeUser?: ActiveUserData,
    ): Promise<void | M> {
      try {
        return activeUser
          ? await this.model.findOneAndUpdate(
              { _id: id },
              { ...updateDto, updatedBy: activeUser.sub },
              {
                new: options.new,
              },
            )
          : await this.model.findOneAndUpdate({ _id: id }, updateDto, {
              new: options.new,
            });
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async updateMany(
      ids: string[],
      conditions: Params,
      options: CustomUpdateOptions,
      activeUser?: ActiveUserData,
    ): Promise<void | M[]> {
      try {
        activeUser
          ? await this.model.updateMany(
              { _id: { $in: ids } },
              { $set: { ...conditions, updatedBy: activeUser.sub } },
            )
          : await this.model.updateMany(
              { _id: { $in: ids } },
              { $set: conditions },
            );

        if (options.new) {
          return await this.model.find({ _id: { $in: ids } });
        }
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async remove(id: string): Promise<void> {
      try {
        await this.model.deleteOne({ _id: id });
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async removeMany(ids: string[]): Promise<void> {
      try {
        await this.model.deleteMany({ _id: { $in: ids } });
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async softRemove(
      id: string,
      activeUser?: ActiveUserData,
    ): Promise<void> {
      try {
        await this.model.updateOne(
          { _id: id },
          {
            deleted: true,
            deletedAt: new Date(),
          },
        );
        if (activeUser) {
          await this.model.updateOne(
            { _id: id },
            {
              deletedBy: activeUser.sub,
            },
          );
        }
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async softRemoveMany(
      ids: string[],
      activeUser?: ActiveUserData,
    ): Promise<void> {
      try {
        await this.model.updateMany(
          { _id: { $in: ids } },
          {
            $set: {
              deleted: true,
              deletedAt: new Date(),
            },
          },
        );
        if (activeUser) {
          await this.model.updateMany(
            { _id: { $in: ids } },
            {
              $set: {
                deletedBy: activeUser.sub,
              },
            },
          );
        }
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async restore(
      id: string,
      activeUser?: ActiveUserData,
    ): Promise<void> {
      try {
        await this.model.updateOne(
          { _id: id },
          {
            deleted: false,
            restoredAt: new Date(),
          },
        );
        if (activeUser) {
          await this.model.updateOne(
            { _id: id },
            {
              restoredBy: activeUser.sub,
            },
          );
        }
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async restoreMany(
      ids: string[],
      activeUser?: ActiveUserData,
    ): Promise<void> {
      try {
        await this.model.updateMany(
          { _id: { $in: ids } },
          {
            $set: {
              deleted: false,
              restoredAt: new Date(),
            },
          },
        );
        if (activeUser) {
          await this.model.updateMany(
            { _id: { $in: ids } },
            {
              $set: {
                restoredBy: activeUser.sub,
              },
            },
          );
        }
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }

    public async count(conditions: Params = {}): Promise<number> {
      try {
        const where: Params = { ...conditions, deleted: false };
        return await this.model.countDocuments(where);
      } catch (err) {
        this.logger.error(err);
        throw new ConflictException(err.message);
      }
    }
  }

  return BaseServiceClass;
}
