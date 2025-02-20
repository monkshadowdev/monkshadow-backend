import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_BASE_URL } from "../config/constant.js";
import { SearchIcon } from "../components/Icons/SearchIcon.jsx";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineDelete } from "react-icons/md";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Skeleton from "react-loading-skeleton";
import Modal from "react-modal";
import { EditIcon } from "../components/Icons/EditIcon.jsx";
import "react-loading-skeleton/dist/skeleton.css";
import { useRoles } from "../RolesContext.jsx";

Modal.setAppElement("#root");

const Service = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [isAddOn, setIsAddOn] = useState("");
  const [addOnIs, setAddOnIs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const { selectCountry } = useRoles();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredserviceList, setFilteredServiceList] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(true);
  const [originalTotalPages, setOriginalTotalPages] = useState(0);

  const fetchData = async (page) => {
    setIsLoading(true); // Start loading
    try {
      const ServiceResponse = await axios.get(
        `${API_BASE_URL}/${selectCountry}/service/getServices?page=${page}`
      );

      const servicesData = ServiceResponse?.data?.services;

      setServices(servicesData);
      setOriginalTotalPages(ServiceResponse.data.pagination.totalPages);
      setTotalPages(ServiceResponse.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!serviceName || !description) {
      setIsLoading(false);
      return toast.warn("Please fill out all required fields.");
    }

    const data = {
      serviceName,
      parentId,
      description, // May be null if no file is provided
      isAddOn,
    };

    try {
      const endpoint = editingContact
        ? `${API_BASE_URL}/${selectCountry}/service/updateService/${editingContact._id}`
        : `${API_BASE_URL}/${selectCountry}/service/addService`;

      await axios.post(endpoint, data, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(
        editingContact
          ? "Contact updated successfully!"
          : "Contact added successfully!"
      );

      fetchData();
      setIsLoading(false);
      closeAddEditModal();
    } catch (error) {
      console.error("Error uploading contact:", error);
      toast.error("Failed to upload contact.");
    } finally {
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (services = null) => {
    setEditingContact(services);
    setServiceName(services ? services.serviceName : "");
    setDescription(services ? services.description : "");
    setParentId(services ? services.parentId : "");
    setIsAddOn(services ? services.isAddOn : "");
    setPageName(services ? services.pageName : "");
    setCompanyName(services ? services.companyName : "");
    setWebsiteUrl(services ? services.websiteUrl : "");
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingContact(null);
  };

  const customStyles = {
    headCells: {
      style: {
        color: "var(--accent)",
        fontWeight: "700",
        fontSize: "14px",
      },
    },
    cells: {
      style: {
        paddingTop: "8px",
        paddingBottom: "8px",
      },
    },
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${selectCountry}/contacts/deleteContact/${id}`
        );
        toast.success("contact deleted successfully!");
        fetchData();
        setIsLoading(false);
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact.");
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg">
          <i className="loader" />
        </div>
      ) : (
        <>
          <div className="mx-auto w-full flex flex-col col-span-12 md:col-span-8 justify-between bg-cardBg rounded-lg card-shadow p-5 gap-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-accent">All Contacts</h3>
              <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                <label htmlFor="search-FAQ">
                  <SearchIcon width={18} height={18} fill={"none"} />
                </label>
                <input
                  id="search-FAQ"
                  // value={searchQuery}
                  // onChange={(e) => {
                  //   fetchSearchData(e.target.value);
                  // }}
                  className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0"
                  type="text"
                  placeholder="Search by service or description etc."
                />
              </div>
              <button
                onClick={() => openModal()}
                className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm font-semibold text-cardBg rounded-lg"
              >
                Add Service
              </button>
            </div>

            {isSearchLoading && (
              <div
                className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto`}
              >
                {filteredserviceList.map((service) => (
                  <div
                    key={service._id}
                    className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">Service:</span>
                      <span className="text-sm">{service.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">
                        Description:
                      </span>
                      <span className="text-sm">{service.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">Parent ID:</span>
                      <span className="text-sm">{service.parentId}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">is Addon</span>
                      <span className="text-sm">{service.isAddOn}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={service.isContactClose}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        // onChange={() => handleContactCloseToggle(service)}
                      />
                      <span className="font-semibold text-sm">
                        service Close
                      </span>
                    </div>
                    <div className="flex absolute top-2.5 right-2 gap-2">
                      <button onClick={() => openModal(service)}>
                        <EditIcon width={16} height={16} fill={"#444050"} />
                      </button>
                      <button
                      // onClick={() => handleDeleteClick(users._id)}
                      >
                        <MdOutlineDelete size={23} fill="#F05F23" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-2">
              <button
                className="font-Outfit px-4 py-1 mr-4 rounded-md text-primary bg-gradient-to-r from-gradientStart to-gradientEnd hover:to-gradientStart duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <button
                className="font-Outfit px-4 py-1 rounded-md text-primary bg-gradient-to-r from-gradientStart to-gradientEnd hover:to-gradientStart duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
            <Modal
              isOpen={isAddEditModalOpen}
              onRequestClose={closeAddEditModal}
              contentLabel="Contact Modal"
              className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
              overlayClassName="overlay"
            >
              <h2 className="text-xl font-bold text-accent">
                {editingContact ? "Edit Contact" : "Add Service"}
              </h2>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="serviceName"
                  className="block text-sm font-semibold required"
                >
                  Service
                </label>
                <input
                  id="serviceName"
                  type="text"
                  value={serviceName}
                  placeholder="Enter Service"
                  onChange={(e) => setName(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold required"
                >
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  placeholder="Enter description"
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="parentId"
                  className="block text-sm font-semibold required"
                >
                  Parent ID
                </label>
                <input
                  id="parentId"
                  type="text"
                  value={parentId}
                  placeholder="Enter parentId No:"
                  onChange={(e) => setParentId(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="isAddOn"
                  className="block text-sm font-semibold "
                >
                  Is addon
                </label>
                <div className="flex gap-2 px-4">
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="Yes"
                      placeholder="Yes"
                      onClick={() => setAddOnIs(true)}
                    />
                    <span className="block text-sm font-semibold pt-0.5">
                      Yes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="No"
                      placeholder="No"
                      onClick={() => setAddOnIs(false)}
                    />
                    <span className="block text-sm font-semibold pt-0.5">
                      No
                    </span>
                  </div>
                </div>
              </div>
              {addOnIs && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="parentId"
                    className="block text-sm font-semibold required"
                  >
                    Price
                  </label>
                  <input
                    id="parentId"
                    type="text"
                    value={parentId}
                    placeholder="Price"
                    onChange={(e) => setParentId(e.target.value)}
                    className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                <button
                  // onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${
                    editingContact
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {editingContact ? "Update Contact" : "Add Service"}
                </button>
                <button
                  onClick={closeAddEditModal}
                  className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300"
                >
                  Cancel
                </button>
              </div>
            </Modal>
          </div>
        </>
      )}
      <ToastContainer />
    </>
  );
};

export default Service;
