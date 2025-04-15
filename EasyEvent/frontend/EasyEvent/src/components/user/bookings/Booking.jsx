import React, { useState, useEffect } from "react"; 
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../Navbar";
import BottomNavbar from "../BottomNavbar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaComments } from "react-icons/fa";
import ChatWidget from "../chat/ChatWidget";

const Booking = () => {
  const { id: venueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = localStorage.getItem("access_token");
  const [chatOpen, setChatOpen] = useState(false);

  // Receive partnerId from navigation state (if passed)
  const partnerIdFromState = location.state?.partnerId;
  console.log("partner Id", partnerIdFromState);

  // API data for halls and food
  const [halls, setHalls] = useState([]);
  const [foods, setFoods] = useState([]);

  // Form state
  const [selectedHall, setSelectedHall] = useState(null);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  // selectedFoods will store the IDs of extra food items chosen by the user.
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([
    { name: "", description: "" },
  ]);

  // Food type filter
  const [selectedFoodType, setSelectedFoodType] = useState("All");

  // Pricing fields
  const [originalPrice, setOriginalPrice] = useState(0);
  // Official total based solely on hall cost (without extra food)
  const officialTotal = guestCount ? guestCount * originalPrice : 0;

  // User offer
  const [offerMode, setOfferMode] = useState("perPlate");
  const [userOfferedValue, setUserOfferedValue] = useState("");
  const [offerError, setOfferError] = useState("");

  // Negotiated price computations
  const [finalPrice, setFinalPrice] = useState(0); // Negotiated price per plate
  const [totalCostFinal, setTotalCostFinal] = useState(0); // Total negotiated cost (offer * guestCount)
  // Extra food cost (price per plate multiplied by guest count for each selected food)
  const [extraFoodCost, setExtraFoodCost] = useState(0);
  // Grand total (for negotiation) = totalCostFinal + extraFoodCost
  const grandTotal = totalCostFinal + extraFoodCost;

  // Capacity error
  const [capacityError, setCapacityError] = useState("");

  // Chat feature
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // New state for booking submission status
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const handleSendMessage = () => {
    if (chatInput.trim() === "") return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
  };

  // Fetch halls with included food populated
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

  // Compute negotiated price whenever offer changes
  useEffect(() => {
    if (guestCount && userOfferedValue) {
      const count = parseInt(guestCount);
      const offerVal = parseFloat(userOfferedValue);
      const offeredPerPlate =
        offerMode === "perPlate" ? offerVal : count ? offerVal / count : 0;
      setFinalPrice(offeredPerPlate);
      setTotalCostFinal(offeredPerPlate * count);
    }
  }, [guestCount, userOfferedValue, offerMode]);

  // Recalculate extra food cost when extra food selection or guest count changes
  useEffect(() => {
    if (!guestCount) return;
    const cost = selectedFoods.reduce((acc, foodId) => {
      const food = foods.find((item) => item._id === foodId);
      return food ? acc + parseFloat(food.price) * parseInt(guestCount) : acc;
    }, 0);
    setExtraFoodCost(cost);
  }, [selectedFoods, foods, guestCount]);

  // Validate guest count
  const handleGuestCountChange = (e) => {
    const value = e.target.value;
  
    // Check if the input is a valid number
    if (!/^\d*$/.test(value)) {
      setCapacityError("Only numbers are allowed.");
      return;
    }
  
    if (selectedHall && parseInt(value) > selectedHall.capacity) {
      setCapacityError(
        `Maximum capacity for ${selectedHall.name} is ${selectedHall.capacity} guests.`
      );
    } else {
      setCapacityError("");
    }
  
    setGuestCount(value);
  };

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  // Validate user offer
  const handleUserOfferedValueChange = (e) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    const minOffer =
      offerMode === "perPlate" ? originalPrice * 0.7 : officialTotal * 0.7;
    if (numValue < minOffer) {
      setOfferError(
        `Minimum allowed offer is ${minOffer.toFixed(2)} (${
          offerMode === "perPlate" ? "per plate" : "total"
        }).`
      );
    } else {
      setOfferError("");
    }
    setUserOfferedValue(value);
  };

  // Toggle extra food selection
  const toggleFoodSelection = (foodId) => {
    if (selectedFoods.includes(foodId)) {
      setSelectedFoods(selectedFoods.filter((id) => id !== foodId));
    } else {
      setSelectedFoods([...selectedFoods, foodId]);
    }
  };

  // Additional services handlers
  const handleServiceChange = (index, field, value) => {
    const newServices = [...additionalServices];
    newServices[index][field] = value;
    setAdditionalServices(newServices);
  };
  const addService = () =>
    setAdditionalServices((prev) => [...prev, { name: "", description: "" }]);
  const removeService = (index) => {
    const newServices = [...additionalServices];
    newServices.splice(index, 1);
    setAdditionalServices(newServices);
  };

  // Submit booking form. Note: The payload now includes both "selected_foods" and an extra field "requested_foods"
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHall) {
      alert("Please select a hall.");
      return;
    }
    if (!eventType || !eventDate || !guestCount) {
      alert("Please fill in all event details.");
      return;
    }
    if (capacityError) {
      alert("Please adjust guest count as per hall capacity.");
      return;
    }
    if (offerError) {
      alert(offerError);
      return;
    }
    const offeredPerPlate =
      offerMode === "perPlate"
        ? parseFloat(userOfferedValue)
        : parseFloat(userOfferedValue) / parseInt(guestCount);
    const finalP = Math.round(
      (parseFloat(originalPrice) + offeredPerPlate) / 2
    );
    const payload = {
      venue: venueId,
      hall: selectedHall._id,
      event_details: {
        event_type: eventType,
        date: eventDate,
        guest_count: parseInt(guestCount),
      },
      // Here we send the selected food IDs so the backend can store them
      selected_foods: selectedFoods,
      additional_services: additionalServices,
      pricing: {
        original_per_plate_price: parseFloat(originalPrice),
        user_offered_per_plate_price: offeredPerPlate,
        final_per_plate_price: finalP,
        total_cost: finalP * parseInt(guestCount) + extraFoodCost,
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
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || "Failed to create booking");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Booking created:", data);
        toast.success("Booking request submitted successfully!");
        setBookingSubmitted(true);
      })
      .catch((err) => {
        console.error("Error creating booking:", err);
        toast.error(
          err.message || "Failed to create booking. Please try again."
        );
      });
  };

  // Filter extra foods (exclude those already included in the hall)
  const extraFoods =
    selectedHall &&
    selectedHall.includedFood &&
    selectedHall.includedFood.length > 0
      ? foods.filter(
          (food) =>
            !selectedHall.includedFood.some((inc) => inc._id === food._id)
        )
      : foods;
  const filteredFoods =
    selectedFoodType === "All"
      ? extraFoods
      : extraFoods.filter((food) => {
          const cat = food.category.toLowerCase();
          return selectedFoodType === "Veg" ? cat === "veg" : cat !== "veg";
        });

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Navbar />
      <ToastContainer />
      
      {/* Main Form Container */}
      <main className="w-full px-6 py-12">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Hall Selection */}
            <section>
              <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                Select a Hall
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {halls.map((hall) => (
                  <div
                    key={hall._id}
                    className={`relative border p-6 rounded-lg cursor-pointer transition duration-200 ease-in-out hover:shadow-lg ${
                      selectedHall && selectedHall._id === hall._id
                        ? "border-orange-600"
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
                    {hall.images && hall.images.length > 0 ? (
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
                        <span className="text-slate-700 font-medium">No Image</span>
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

            {/* Included Food Items */}
            {selectedHall &&
              selectedHall.includedFood &&
              selectedHall.includedFood.length > 0 && (
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

            {/* Event Details */}
            <section>
              <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                Event Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block font-medium mb-2">
                    Event Type
                  </label>
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
                  <label className="block font-medium mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">
                    Guest Count
                  </label>
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

            {/* Extra Food Selection */}
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
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-slate-200 text-slate-800 hover:bg-orange-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {filteredFoods && filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => (
                    <div
                      key={food._id}
                      className={`border p-4 rounded-md cursor-pointer transition transform hover:scale-105 ${
                        selectedFoods.includes(food._id)
                          ? "border-orange-600 shadow-lg"
                          : "border-slate-300"
                      }`}
                      onClick={() => toggleFoodSelection(food._id)}
                    >
                      <p className="text-center font-medium">{food.name}</p>
                      <p className="text-center text-xs text-slate-600">${food.price}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-slate-600">
                    No additional food items available.
                  </div>
                )}
              </div>
            </section>

            {/* Additional Services */}
            <section>
              <h2 className="text-2xl font-semibold border-b border-slate-300 pb-2 mb-6">
                Additional Services
              </h2>
              {additionalServices.map((service, index) => (
                <div key={index} className="bg-gray-100 border border-slate-300 p-4 rounded-md mb-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-lg">
                      Service {index + 1}
                    </span>
                    {additionalServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
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
                        handleServiceChange(index, "name", e.target.value)
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
                        handleServiceChange(index, "description", e.target.value)
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
                className="px-4 py-2 bg-orange-600 text-white rounded-md transition duration-200 hover:bg-orange-500"
              >
                Add Service
              </button>
            </section>

            {/* Pricing Section */}
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
                              parseFloat(originalPrice) * parseInt(guestCount) +
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
                            ? "bg-orange-600 text-white shadow-md"
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
                            ? "bg-orange-600 text-white shadow-md"
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
                      <span className="font-semibold">{finalPrice}</span>
                    </p>
                    <p className="text-base">
                      Total Final Cost:{" "}
                      <span className="font-semibold">{totalCostFinal}</span>
                    </p>
                    <p className="text-base">
                      Extra Food Cost:{" "}
                      <span className="font-semibold">
                        ${extraFoodCost.toFixed(2)}
                      </span>{" "}
                      <span className="text-sm">(for your selected extra food)</span>
                    </p>
                    <p className="text-xl font-bold mt-2">
                      Grand Total (Your Offer + Extras): ${grandTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="text-center">
              <button
                type="submit"
                className={`w-60 py-4 rounded-lg font-bold transition duration-200 ${
                  bookingSubmitted
                    ? "bg-green-700 text-white cursor-not-allowed"
                    : "bg-orange-600 text-white hover:shadow-xl"
                }`}
                disabled={bookingSubmitted}
              >
                {bookingSubmitted
                  ? "Booking submitted"
                  : "Submit Booking Request"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Chat Button */}
      {!chatOpen && (
        <div
          className="fixed bottom-10 right-6 bg-orange-600 p-4 rounded-full cursor-pointer text-white shadow-xl hover:scale-110 transition transform duration-300"
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
