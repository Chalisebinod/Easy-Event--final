// src/components/booking/Booking.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../Navbar";
import BottomNavbar from "../BottomNavbar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaComments, FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import ChatWidget from "../chat/ChatWidget";

const Booking = () => {
  const { id: venueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = localStorage.getItem("access_token");
  const partnerIdFromState = location.state?.partnerId;

  // Modes & flags
  const [isPreview, setIsPreview] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Data from API
  const [halls, setHalls] = useState([]);
  const [foods, setFoods] = useState([]);

  // Form state
  const [selectedHall, setSelectedHall] = useState(null);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([
    { name: "", description: "" },
  ]);

  // Food filter & pricing
  const [selectedFoodType, setSelectedFoodType] = useState("All");
  const [originalPrice, setOriginalPrice] = useState(0);
  const officialTotal = guestCount ? guestCount * originalPrice : 0;

  // Negotiation
  const [offerMode, setOfferMode] = useState("perPlate");
  const [userOfferedValue, setUserOfferedValue] = useState("");
  const [offerError, setOfferError] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [totalCostFinal, setTotalCostFinal] = useState(0);

  // Extra food cost
  const [extraFoodCost, setExtraFoodCost] = useState(0);
  const grandTotal = totalCostFinal + extraFoodCost;

  // Validation
  const [capacityError, setCapacityError] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // On mount, check for pending booking
  useEffect(() => {
    if (localStorage.getItem(`booking_${venueId}`) === "pending") {
      setHasPendingBooking(true);
    }
  }, [venueId]);

  // Fetch halls
  useEffect(() => {
    if (!venueId) return;
    fetch(`http://localhost:8000/api/halls/${venueId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setHalls(data.halls || []))
      .catch((err) => console.error("Error fetching halls:", err));
  }, [venueId, accessToken]);

  // Fetch foods
  useEffect(() => {
    if (!venueId) return;
    fetch(`http://localhost:8000/api/food/venue/${venueId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setFoods(data.foods || []))
      .catch((err) => console.error("Error fetching foods:", err));
  }, [venueId, accessToken]);

  // Compute finalPrice & totalCostFinal
  useEffect(() => {
    if (guestCount && userOfferedValue) {
      const count = parseInt(guestCount, 10);
      const offerVal = parseFloat(userOfferedValue);
      const perPlate =
        offerMode === "perPlate" ? offerVal : offerVal / count || 0;
      setFinalPrice(perPlate);
      setTotalCostFinal(perPlate * count);
    }
  }, [guestCount, userOfferedValue, offerMode]);

  // Compute extra food cost
  useEffect(() => {
    if (!guestCount) return;
    const count = parseInt(guestCount, 10);
    const cost = selectedFoods.reduce((sum, foodId) => {
      const f = foods.find((x) => x._id === foodId);
      return f ? sum + parseFloat(f.price) * count : sum;
    }, 0);
    setExtraFoodCost(cost);
  }, [selectedFoods, foods, guestCount]);

  // Validation handlers
  const handleGuestCountChange = (e) => {
    const v = e.target.value;
    if (!/^\d*$/.test(v)) {
      setCapacityError("Only numbers are allowed.");
      return;
    }
    if (selectedHall && parseInt(v, 10) > selectedHall.capacity) {
      setCapacityError(
        `Maximum capacity for ${selectedHall.name} is ${selectedHall.capacity}.`
      );
    } else {
      setCapacityError("");
    }
    setGuestCount(v);
  };

  const handleUserOfferedValueChange = (e) => {
    const v = e.target.value;
    const num = parseFloat(v);
    const min =
      offerMode === "perPlate" ? originalPrice * 0.7 : officialTotal * 0.7;
    if (num < min) {
      setOfferError(
        `Minimum allowed offer is ${min.toFixed(2)} ${
          offerMode === "perPlate" ? "per plate" : "total"
        }.`
      );
    } else {
      setOfferError("");
    }
    setUserOfferedValue(v);
  };

  // Toggle extra food
  const toggleFoodSelection = (id) =>
    setSelectedFoods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Additional services
  const handleServiceChange = (i, field, v) => {
    const arr = [...additionalServices];
    arr[i][field] = v;
    setAdditionalServices(arr);
  };
  const addService = () =>
    setAdditionalServices((prev) => [...prev, { name: "", description: "" }]);
  const removeService = (i) => {
    const arr = [...additionalServices];
    arr.splice(i, 1);
    setAdditionalServices(arr);
  };

  // Filter foods
  const extraFoods =
    selectedHall?.includedFood?.length > 0
      ? foods.filter(
          (f) => !selectedHall.includedFood.some((inc) => inc._id === f._id)
        )
      : foods;
  const filteredFoods =
    selectedFoodType === "All"
      ? extraFoods
      : extraFoods.filter((f) => {
          const cat = f.category.toLowerCase();
          return selectedFoodType === "Veg" ? cat === "veg" : cat !== "veg";
        });

  // 1) Preview trigger
  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasPendingBooking) return;
    if (!selectedHall) return alert("Please select a hall.");
    if (!eventType || !eventDate || !guestCount)
      return alert("Please fill in all event details.");
    if (capacityError) return alert(capacityError);
    if (offerError) return alert(offerError);
    setIsPreview(true);
    window.scrollTo(0, 0);
  };

  // 2) Final confirm
  const handleFinalSubmit = () => {
    const offeredPerPlate =
      offerMode === "perPlate"
        ? parseFloat(userOfferedValue)
        : parseFloat(userOfferedValue) / parseInt(guestCount, 10);
    const finalP = Math.round(
      (parseFloat(originalPrice) + offeredPerPlate) / 2
    );
    const payload = {
      venue: venueId,
      hall: selectedHall._id,
      event_details: {
        event_type: eventType,
        date: eventDate,
        guest_count: parseInt(guestCount, 10),
      },
      selected_foods: selectedFoods,
      additional_services: additionalServices,
      pricing: {
        original_per_plate_price: parseFloat(originalPrice),
        user_offered_per_plate_price: offeredPerPlate,
        final_per_plate_price: finalP,
        total_cost: finalP * parseInt(guestCount, 10) + extraFoodCost,
      },
    };

    fetch("http://localhost:8000/api/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((data) => {
            throw new Error(data.message || "Failed to create booking");
          });
        return res.json();
      })
      .then(() => {
        toast.success("Booking request submitted successfully!");
        localStorage.setItem(`booking_${venueId}`, "pending");
        setHasPendingBooking(true);
        setBookingSubmitted(true);
      })
      .catch((err) => {
        console.error("Error creating booking:", err);
        toast.error(err.message || "Failed to create booking.");
      });
  };

  // Chat handlers
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: chatInput,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Navbar />
      <ToastContainer />

      {!isPreview ? (
        <main className="w-full px-6 py-12">
          <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-8 relative">

            {/* Dim + blur overlay */}
            {hasPendingBooking && (
              <div
  className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10"
  style={{ marginBottom: '60rem' }} // Custom margin
>
  <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm text-center space-y-4" style={{ marginTop: '-100px' }}>
    <FaInfoCircle className="mx-auto text-4xl text-blue-600" />
    <h3 className="text-2xl font-semibold text-gray-800">
      Event In Process
    </h3>
    <p className="text-gray-600">
      You can’t make another booking for this venue until your current event is completed.
    </p>
    <button
      onClick={() => navigate("/user-dashboard")}
      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
    >
      <FaArrowLeft /> <span>Back to Dashboard</span>
    </button>
  </div>
</div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`space-y-12 ${
                hasPendingBooking ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {/* 1) Hall Selection */}
              <section>
                <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                  Select a Hall
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {halls.map((hall) => (
                    <div
                      key={hall._id}
                      className={`relative border p-6 rounded-lg cursor-pointer transition duration-200 ease-in-out hover:shadow-lg ${
                        selectedHall?._id === hall._id
                          ? "border-green-600"
                          : "border-slate-300"
                      } ${!hall.isAvailable && "opacity-60 cursor-not-allowed"}`}
                      onClick={() => {
                        if (!hall.isAvailable) return;
                        setSelectedHall(hall);
                        setOriginalPrice(
                          hall.pricePerPlate || hall.basePricePerPlate
                        );
                        setSelectedFoods([]);
                      }}
                    >
                      {hall.images?.length ? (
                        <img
                          src={`http://localhost:8000/${hall.images[0].replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={hall.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                          <span className="text-slate-700 font-medium">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xl font-medium">{hall.name}</p>
                        <p className="text-sm text-slate-600">
                          Capacity: {hall.capacity}
                        </p>
                        {!hall.isAvailable && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Not Available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2) Included Food */}
              {selectedHall?.includedFood?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                    Included Food Items
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {selectedHall.includedFood.map((food) => (
                      <span
                        key={food._id}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {food.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 3) Event Details */}
              <section>
                <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block font-medium mb-2">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">Select Event Type</option>
                      <option value="Marriage">Marriage</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="eventDate"
                      className="block font-medium text-gray-700 mb-1"
                    >
                      Event Date
                    </label>
                    <input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Guest Count</label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={handleGuestCountChange}
                      className={`w-full p-3 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 ${
                        capacityError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-slate-900"
                      }`}
                      min="1"
                    />
                    {capacityError && (
                      <p className="mt-1 text-sm text-red-500">
                        {capacityError}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* 4) Additional Food */}
              <section>
                <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                  Additional Food Items
                </h2>
                <div className="flex space-x-4 mb-6">
                  {["All", "Veg", "Non Veg"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedFoodType(type)}
                      className={`px-4 py-2 rounded-full transition duration-200 ${
                        selectedFoodType === type
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-slate-200 text-slate-800 hover:bg-green-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                      <div
                        key={food._id}
                        className={`border p-4 rounded-md cursor-pointer transition transform hover:scale-105 ${
                          selectedFoods.includes(food._id)
                            ? "border-green-600 shadow-lg"
                            : "border-slate-300"
                        }`}
                        onClick={() => toggleFoodSelection(food._id)}
                      >
                        <p className="text-center font-medium">{food.name}</p>
                        <p className="text-center text-xs text-slate-600">
                          ${food.price}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-slate-600">
                      No additional food items available.
                    </div>
                  )}
                </div>
              </section>

              {/* 5) Additional Services */}
              <section>
                <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                  Additional Services
                </h2>
                {additionalServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 border border-slate-300 p-4 rounded-md mb-6 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-lg">
                        Service {idx + 1}
                      </span>
                      {additionalServices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block font-medium mb-2">
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) =>
                          handleServiceChange(idx, "name", e.target.value)
                        }
                        className="w-full p-3 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter service name"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) =>
                          handleServiceChange(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Enter description"
                      ></textarea>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addService}
                  className="px-4 py-2 bg-green-600 text-white rounded-md transition duration-200 hover:bg-green-500"
                >
                  Add Service
                </button>
              </section>

              {/* 6) Pricing Section */}
              <section>
                <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Official Pricing */}
                  <div className="p-6 border rounded-md bg-gray-100 shadow-inner">
                    <h3 className="text-xl font-semibold mb-4">
                      Official Pricing
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-2">
                          Price per Plate
                        </label>
                        <input
                          type="number"
                          value={originalPrice}
                          readOnly
                          className="w-full p-3 border border-slate-300 rounded-md bg-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2">
                          Extra Food Cost
                        </label>
                        <input
                          type="number"
                          value={guestCount ? extraFoodCost.toFixed(2) : 0}
                          readOnly
                          className="w-full p-3 border border-slate-300 rounded-md bg-gray-200"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block font-medium mb-2">
                        Grand Official Price
                      </label>
                      <input
                        type="number"
                        value={
                          guestCount
                            ? (
                                parseFloat(originalPrice) *
                                  parseInt(guestCount, 10) +
                                extraFoodCost
                              ).toFixed(2)
                            : 0
                        }
                        readOnly
                        className="w-full p-3 border border-slate-300 rounded-md bg-gray-200"
                      />
                    </div>
                  </div>

                  {/* Your Offer */}
                  <div className="p-6 border rounded-md bg-gray-100 shadow-inner">
                    <h3 className="text-xl font-semibold mb-4">Your Offer</h3>
                    <div className="mb-6">
                      <label className="block font-medium mb-2">
                        Select Offer Type
                      </label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setOfferMode("perPlate");
                            setUserOfferedValue("");
                            setOfferError("");
                          }}
                          className={`px-4 py-2 rounded-md transition duration-200 ${
                            offerMode === "perPlate"
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          }`}
                        >
                          Per Plate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOfferMode("total");
                            setUserOfferedValue("");
                            setOfferError("");
                          }}
                          className={`px-4 py-2 rounded-md transition duration-200 ${
                            offerMode === "total"
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                          }`}
                        >
                          Total
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {offerMode === "perPlate" ? (
                        <>
                          <div>
                            <label className="block font-medium mb-2">
                              Offered Price per Plate
                            </label>
                            <input
                              type="number"
                              value={userOfferedValue}
                              onChange={handleUserOfferedValueChange}
                              placeholder="Enter your offered price"
                              className="w-full p-3 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-2">
                              Total Offer
                            </label>
                            <input
                              type="number"
                              value={
                                guestCount && userOfferedValue
                                  ? guestCount * userOfferedValue
                                  : ""
                              }
                              readOnly
                              className="w-full p-3 border border-slate-300 rounded-md bg-white"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block font-medium mb-2">
                              Offered Total Price
                            </label>
                            <input
                              type="number"
                              value={userOfferedValue}
                              onChange={handleUserOfferedValueChange}
                              placeholder="Enter your offered total price"
                              className="w-full p-3 border border-slate-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-2">
                              Equivalent Price per Plate
                            </label>
                            <input
                              type="number"
                              value={
                                guestCount && userOfferedValue
                                  ? (userOfferedValue / guestCount).toFixed(2)
                                  : ""
                              }
                              readOnly
                              className="w-full p-3 border border-slate-300 rounded-md bg-gray-200"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {offerError && (
                      <p className="mt-2 text-sm text-red-500">{offerError}</p>
                    )}

                    <div className="mt-6 border-t pt-4">
                      <p className="text-base">
                        Final Accepted Price per Plate:{" "}
                        <span className="font-semibold">
                          {finalPrice.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-base">
                        Total Final Cost:{" "}
                        <span className="font-semibold">
                          {totalCostFinal.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-base">
                        Extra Food Cost:{" "}
                        <span className="font-semibold">
                          ${extraFoodCost.toFixed(2)}
                        </span>{" "}
                        <span className="text-sm">
                          (for your selected extra food)
                        </span>
                      </p>
                      <p className="text-xl font-bold mt-2">
                        Grand Total (Your Offer + Extras): $
                        {grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Smaller Preview button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-bold bg-green-600 text-white hover:shadow-xl text-sm"
                >
                  Preview Booking
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main className="w-full px-6 py-12">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-8">
            <h2 className="text-3xl font-semibold text-center">
              Review Your Booking
            </h2>

            {/* Edit if not yet submitted */}
            {!bookingSubmitted && (
              <div className="text-right">
                <button
                  onClick={() => {
                    setIsPreview(false);
                    window.scrollTo(0, 0);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                >
                  Edit Booking
                </button>
              </div>
            )}

            {/* Summary sections */}
            <section>
              <h3 className="text-xl font-semibold mb-2">Hall</h3>
              <p>
                {selectedHall.name} (Capacity: {selectedHall.capacity})
              </p>
            </section>

            {selectedHall.includedFood?.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-2">
                  Included Food
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHall.includedFood.map((f) => (
                    <span
                      key={f._id}
                      className="px-3 py-1 bg-green-100 rounded-full text-sm"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-xl font-semibold mb-2">Event Details</h3>
              <p>Type: {eventType}</p>
              <p>
                Date:{" "}
                {new Date(eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>Guests: {guestCount}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                Additional Food
              </h3>
              {selectedFoods.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {selectedFoods.map((id) => {
                    const f = foods.find((x) => x._id === id);
                    return (
                      <li key={id}>
                        {f.name} × {guestCount} ($
                        {parseFloat(f.price).toFixed(2)} each)
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm">No extra food items selected.</p>
              )}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                Additional Services
              </h3>
              {additionalServices.map((s, i) => (
                <p key={i} className="text-sm mb-1">
                  <strong>{s.name}</strong>: {s.description}
                </p>
              ))}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                Pricing Breakdown
              </h3>
              <p className="text-sm">Official per plate: ${originalPrice}</p>
              <p className="text-sm">
                Extra food cost: ${extraFoodCost.toFixed(2)}
              </p>
              <p className="text-sm">
                Your offer (
                {offerMode === "perPlate" ? "per plate" : "total"}):{" "}
                {offerMode === "perPlate"
                  ? `$${parseFloat(userOfferedValue).toFixed(2)} per plate`
                  : `$${parseFloat(userOfferedValue).toFixed(2)} total`}
              </p>
              <p className="text-sm">
                Final agreed per plate: ${finalPrice.toFixed(2)}
              </p>
              <p className="text-sm">
                Total final cost (plates + extras): ${grandTotal.toFixed(2)}
              </p>
            </section>

            {/* Confirm / Completed */}
            <div className="text-center">
              <button
                onClick={handleFinalSubmit}
                className={`px-6 py-3 rounded-lg font-bold hover:shadow-xl text-sm ${
                  bookingSubmitted
                    ? "bg-red-600 text-white cursor-not-allowed"
                    : "bg-green-600 text-white"
                }`}
                disabled={bookingSubmitted}
              >
                {bookingSubmitted ? "Booking Completed" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Chat */}
      {!chatOpen && (
        <div
          className="fixed bottom-10 right-6 bg-green-600 p-4 rounded-full cursor-pointer text-white shadow-xl hover:scale-110 transition"
          onClick={openChat}
          title="Chat with Venue Owner"
        >
          <FaComments size={28} />
        </div>
      )}
      {chatOpen && (
        <ChatWidget partnerId={partnerIdFromState} onClose={closeChat} />
      )}

      <BottomNavbar />
    </div>
  );
};

export default Booking;
