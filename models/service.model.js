import mongoose from "mongoose";

// Define the schema for contacts
const serviceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    parentId: { type: String, required: false },
    isAddOn: { type: Boolean, required: false },
    servicePrice: { type: Number, required: false }
  },
  { timestamps: true }
);

// Dynamic model getter function
const getServiceModel = (region) => {
  const collectionName =
    region === "canada" ? "canada_services" : "india_services";
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, serviceSchema, collectionName)
  );
};

export default getServiceModel;
