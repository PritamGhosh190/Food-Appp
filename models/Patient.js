const {Schema, model} = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const patientSchema = new Schema(
  {
    cr_number: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
    },
    name: String,
    age: String,
    dob: {
      type: Date,
      default: undefined,
    },
    gender: String,
    state: String,
    smoking: String,
    family_history: String,
    gene: String,
    variant: String,
    treatment_at_rgci: String,
    phone_number: String,
    status_at_last_follow_up: String,
    date_of_last_follow_up: {
      type: Date,
      default: undefined,
    },
    date_of_hpe_diagnosis: {
      type: Date,
      default: undefined,
    },
    ecog_ps: String,
    extrathoracic_mets: String,
    brain_mets: String,
    letptomeningeal_mets: String,
    histology: String,
    pdl1: String,
    brg1: String,
    ttf1: String,
    small_cell_transformation_date: {
      type: Date,
      default: undefined,
    },
    vaf: String,
    co_mutation: String,
    is_deleted: {
      type: Boolean,
      default: false,
    },
    lots: [
      {
        type: Schema.Types.ObjectId,
        ref: 'LOT',
      },
    ],
    is_new: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

patientSchema.plugin(uniqueValidator)

module.exports = model('Patient', patientSchema)
