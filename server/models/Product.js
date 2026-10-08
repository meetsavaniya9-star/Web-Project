const { getActiveDbType } = require('../config/db');
const MongooseProduct = require('./mongooseProduct');
const JsonProduct = require('./jsonProduct');
const MysqlProduct = require('./mysqlProduct');

/**
 * Unified Model Interface for Product Entity
 * Follows the MVC Model pattern: abstracts data persistence, schema validations,
 * and querying away from Controllers.
 */
class ProductModel {
  static getDelegate() {
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      return MongooseProduct;
    }
    if (dbType === 'mysql') {
      return MysqlProduct;
    }
    return JsonProduct;
  }

  static async find(query = {}, options = {}) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();

    if (dbType === 'mongodb') {
      let filter = {};
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { sku: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } }
        ];
      }
      if (query.category && query.category !== 'All') {
        filter.category = query.category;
      }
      if (query.status && query.status !== 'All') {
        filter.status = query.status;
      }

      let mongoQuery = delegate.find(filter);
      if (options.sortBy) {
        const order = options.sortOrder === 'asc' ? 1 : -1;
        mongoQuery = mongoQuery.sort({ [options.sortBy]: order });
      } else {
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
      }

      return await mongoQuery.lean().exec();
    }

    return await delegate.find(query, options);
  }

  static async findById(id) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      return await delegate.findById(id).lean().exec();
    }
    return await delegate.findById(id);
  }

  static async findOne(criteria) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      return await delegate.findOne(criteria).lean().exec();
    }
    return await delegate.findOne(criteria);
  }

  static async create(data) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      const created = await delegate.create(data);
      return created.toObject ? created.toObject() : created;
    }
    return await delegate.create(data);
  }

  static async findByIdAndUpdate(id, data, options = { new: true }) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      return await delegate
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .lean()
        .exec();
    }
    return await delegate.findByIdAndUpdate(id, data, options);
  }

  static async findByIdAndDelete(id) {
    const delegate = this.getDelegate();
    const dbType = getActiveDbType();
    if (dbType === 'mongodb') {
      return await delegate.findByIdAndDelete(id).lean().exec();
    }
    return await delegate.findByIdAndDelete(id);
  }

  static async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

module.exports = ProductModel;
