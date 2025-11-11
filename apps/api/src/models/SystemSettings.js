const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

systemSettingsSchema.statics.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

systemSettingsSchema.statics.setSetting = async function(key, value, description = '', updatedBy = null) {
  return await this.findOneAndUpdate(
    { key },
    { 
      value, 
      description,
      lastUpdatedBy: updatedBy,
    },
    { 
      upsert: true, 
      new: true,
      runValidators: true,
    }
  );
};

systemSettingsSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'deployment_price_sol',
      value: 0.073,
      description: 'Token deployment price in SOL',
    },
    {
      key: 'transaction_fee_percent',
      value: 2,
      description: 'Transaction fee percentage',
    },
    {
      key: 'market_creation_cost_sol',
      value: 0.4,
      description: 'OpenBook market creation cost in SOL',
    },
    {
      key: 'bonding_curve_graduation_threshold',
      value: 85,
      description: 'Market cap in SOL for bonding curve graduation to DEX',
    },
  ];

  for (const setting of defaults) {
    const exists = await this.findOne({ key: setting.key });
    if (!exists) {
      await this.create(setting);
    }
  }
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
