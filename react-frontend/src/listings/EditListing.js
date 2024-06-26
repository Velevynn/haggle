import React, {useState, useEffect} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import Footer from "../components/Footer";
import ArrowButton from "../components/ArrowButton";
import LoadingSpinner from "../components/LoadingSpinner";
import Notify from "../components/ErrorNotification";

function EditListing() {
	const MINIMUM_IMAGE_WIDTH = 500;
	const MINIMUM_IMAGE_HEIGHT = 500;
	const categories = [
		"No Change",
		"Other",
		"Vehicles",
		"Property Rentals",
		"Apparel",
		"Classifieds",
		"Electronics",
		"Entertainment",
		"Family",
		"Free Stuff",
		"Garden & Outdoor",
		"Hobbies",
		"Home Goods",
		"Home Improvement",
		"Supplies",
		"Home Improvement Supplies",
		"Home Sales",
		"Musical Instruments",
		"Office Supplies",
		"Pet Supplies",
		"Sporting Goods",
		"Toys & Games",
		"Buy and Sell Groups"
	];
	const {listingID} = useParams();
	const navigate = useNavigate();
	const [imageDisplay, setImages] = useState([]);
	const [imagesToRemove, setImagesToRemove] = useState([]);
	const [loading, setLoading] = useState(true);
	const [key, setKey] = useState(0); // Allows notification to appear multiple times for same image
	const [showNotification, setShowNotification] = useState(false); // Shows notification
	const [notificationMsg, setNotificationMsg] = useState(""); // Sets notification msg
	const [listing, setListing] = useState({
		userID: null,
		title: "",
		description: "",
		price: "",
		expirationDate: null,
		quantity: 1,
		newImages: [],
		category: null
	});

	const categoryOptions = categories.map((category, index) => (
		<option key={index} value={category}>
			{category}
		</option>
	));

	// Function to fetch and set the existing listing data including images
	useEffect(() => {
		const fetchListing = async () => {
			try {
				const token = localStorage.getItem(
					process.env.REACT_APP_JWT_TOKEN_NAME
				);
				const decodedToken = jwtDecode(token);
				const username = decodedToken.username;
				console.log("username: ", username);

				// Fetch listing details including images
				const response = await axios.get(
					process.env.REACT_APP_BACKEND_LINK +
						`/listings/${listingID}`,
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);

				const fetchedListing = response.data[0];

				if (
					fetchedListing &&
					typeof fetchedListing.price !== "undefined" &&
					typeof fetchedListing.title !== "undefined"
				) {
					setListing(prevListing => ({
						...prevListing,
						userID: fetchedListing.userID,
						title: fetchedListing.title,
						description: fetchedListing.description || "",
						price: fetchedListing.price.toString(),
						expirationDate: fetchedListing.expirationDate || null,
						quantity: fetchedListing.quantity || 1,
						category: fetchedListing.category
					}));
					fetchImages();
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		};

		const fetchImages = async () => {
			try {
				/* Fetch images for the listing from the backend */
				const response = await axios.get(
					process.env.REACT_APP_BACKEND_LINK +
						`/listings/images/${listingID}`
				);
				if (response.data.length > 0) {
					setImages(response.data);

					console.log(response.data);
				}
			} catch (error) {
				console.error("Error fetching images:", error);
			}
		};

		fetchListing();
	}, [listingID]);

	function displayNotification(message) {
		// Displays a notification with the given message
		setNotificationMsg(message);
		setShowNotification(true);
		setTimeout(() => {
			// Hides notification after 3 seconds
			setShowNotification(false);
		}, 3300);
	}

	const handleChange = event => {
		const {name, value} = event.target;
		setListing(prevListing => ({
			...prevListing,
			[name]: value
		}));
	};

	const handleImageChange = event => {
		const files = Array.from(event.target.files);
		if (files.length > 8) {
			// Checks if number of images selected is greater than 8
			displayNotification("Max number of images is 8");
			setListing(prevListing => ({
				...prevListing,
				images: []
			}));
			setKey(key === 0 ? 1 : 0);
			return;
		}

		const promises = files.map(file => {
			// Turns files uploaded into image object
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = event => {
					const img = new Image();
					img.src = event.target.result;
					img.onload = () => {
						resolve({file, width: img.width, height: img.height});
					};
					img.onerror = () => {
						reject(new Error("Failed to load image"));
					};
				};
				reader.readAsDataURL(file);
			});
		});

		Promise.all(promises)
			.then(results => {
				// Check if any images are under 500x500 minimum resolution
				const nonValidImages = results.filter(({width, height}) => {
					return (
						width < MINIMUM_IMAGE_WIDTH ||
						height < MINIMUM_IMAGE_HEIGHT
					);
				});
				if (nonValidImages.length > 0) {
					setListing(prevListing => ({
						...prevListing,
						images: []
					}));
					displayNotification(
						`Minimum image resolution: ${MINIMUM_IMAGE_WIDTH}x${MINIMUM_IMAGE_HEIGHT}px`
					);
					setKey(key === 0 ? 1 : 0);
					// Don't update the state if there are non-valid images
				} else {
					// Update the state with valid images if all images meet the resolution criteria
					setListing(prevListing => ({
						...prevListing,
						newImages: [...prevListing.newImages, ...files]
					}));
					setKey(key === 0 ? 1 : 0);
				}
			})
			.catch(error => {
				console.error("Error validating image:", error);
				displayNotification("Error validating image file");
				return [];
			});
	};

	const handleDeleteOldImage = async indexToRemove => {
		setImagesToRemove(prevImagesToRemove => {
			// Create a copy of the previous array to avoid mutation
			const newImagesToRemove = [...prevImagesToRemove];
			// Append imageDisplay[indexToRemove] to the new array
			newImagesToRemove.push(imageDisplay[indexToRemove]);
			// Return the updated array
			return newImagesToRemove;
		});
		setImages(prevImageDisplay => {
			// Create a copy of the previous array to avoid mutation
			const newImageDisplay = [...prevImageDisplay];
			// Remove the corresponding item from imageDisplay
			newImageDisplay.splice(indexToRemove, 1);
			// Return the updated array
			return newImageDisplay;
		});
	};
	const handleDeleteNewImage = async indexToRemove => {
		setListing(prevListing => ({
			...prevListing,
			newImages: prevListing.newImages.filter(
				(_, index) => index !== indexToRemove
			)
		}));
	};

	const submitForm = async () => {
		if (listing.title !== "" && listing.price !== "") {
			try {
				const token = localStorage.getItem(
					process.env.REACT_APP_JWT_TOKEN_NAME
				);

				// Send PUT request to update listing details
				await axios.put(
					process.env.REACT_APP_BACKEND_LINK +
						`/listings/${listingID}`,
					listing,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json"
						}
					}
				);

				// Update images for the listing
				const newImages = new FormData();
				listing.newImages.forEach(image => {
					newImages.append("image", image);
				});

				// Send PUT request to update listing images
				await axios.put(
					process.env.REACT_APP_BACKEND_LINK +
						`/listings/images/${listingID}`,
					newImages,
					{
						params: {imagesToRemove},
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "multipart/form-data"
						}
					}
				);
				// Redirect to the marketplace page after successful update
				navigate(`/listings/${listingID}`);
			} catch (error) {
				console.log("Error updating listing:", error);
			}
		}
	};

	//TODO: how to set selected category to existing category
	return (
		<div>
			{loading ? (
				<div>
					<LoadingSpinner />
				</div>
			) : (
				<div>
					<div className="vertical-center margin">
						<div className="small-container drop-shadow">
							<div
								className="vertical-center"
								style={{
									display: "flex",
									alignItems: "center",
									marginRight: "1.5em"
								}}
							>
								<div
									onClick={() => {
										navigate(-1);
									}}
									style={{rotate: "-90deg"}}
								>
									<ArrowButton></ArrowButton>
								</div>
								<h2
									style={{
										fontSize: "2rem",
										margin: "0",
										marginLeft: "5px"
									}}
								>
									Edit Listing
								</h2>
							</div>
							<form>
								<label htmlFor="title">New Title</label>
								<input
									type="text"
									name="title"
									id="title"
									value={listing.title}
									onChange={handleChange}
								/>
								<label htmlFor="category">New Category</label>
								<select
									id="category"
									name="category"
									onChange={handleChange}
								>
									{categoryOptions}
								</select>
								<label htmlFor="description">
									New Description
								</label>
								<textarea
									name="description"
									id="description"
									value={listing.description}
									onChange={handleChange}
								/>
								<label htmlFor="price">New Price</label>
								<input
									type="text"
									name="price"
									id="price"
									value={listing.price}
									onChange={handleChange}
								/>
								<div className="thumbnails">
									{/*For displaying thumbnails, with hover stuff*/}
									{imageDisplay.map((image, index) => (
										<div
											key={index}
											style={{
												position: "relative",
												display: "inline-block"
											}}
											onMouseEnter={e =>
												(e.currentTarget.querySelector(
													".delete-overlay"
												).style.visibility = "visible")
											}
											onMouseLeave={e =>
												(e.currentTarget.querySelector(
													".delete-overlay"
												).style.visibility = "hidden")
											}
											onClick={() =>
												handleDeleteOldImage(index)
											}
										>
											<img
												src={image.imageURL}
												alt={`Thumbnail ${index}`}
												style={{
													marginRight: "10px",
													cursor: "pointer",
													transition:
														"opacity 0.2s ease"
												}}
												onMouseEnter={e =>
													(e.target.style.opacity = 0.5)
												}
												onMouseLeave={e =>
													(e.target.style.opacity = 1)
												}
											/>
											<div
												className="delete-overlay"
												style={{
													position: "absolute",
													top: "5px",
													right: "7px",
													visibility: "hidden",
													cursor: "pointer"
												}}
											>
												{/* Red "X" icon */}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="#e3101a"
													style={{
														filter: "drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.5))"
													}}
												>
													<path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59 5.59-5.59z" />
												</svg>
											</div>
										</div>
									))}
									{/*For displaying new selected images*/}
									{listing.newImages.map((file, index) => (
										<img
											key={`new-${index}`}
											src={URL.createObjectURL(file)}
											alt={`New Thumbnail ${index}`}
											style={{marginRight: "10px"}}
											onClick={() =>
												handleDeleteNewImage(index)
											}
										/>
									))}
								</div>

								{/*For displaying how many images have been selected*/}
								{listing.newImages.length > 0 && (
									<p>
										{listing.newImages.length} new image(s)
										selected
									</p>
								)}
							</form>
							<div className="vertical-center">
								<div className="margin-top">
									<label htmlFor="images" className="button">
										<span>Add Images</span>
										<input
											type="file"
											name="images"
											id="images"
											key={key}
											accept="image/*"
											multiple
											className="custom-file-input"
											onChange={handleImageChange}
										/>
									</label>
									{showNotification && (
										<Notify message={notificationMsg} />
									)}
								</div>
							</div>
							<div className="vertical-center">
								<button
									className="margin-top"
									onClick={submitForm}
								>
									Update
								</button>
							</div>
						</div>
					</div>
					<Footer />
				</div>
			)}
		</div>
	);
}

export default EditListing;
