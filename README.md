# BaseCampX Website
BasecampX is a comprehensive platform designed to streamline outdoor adventure planning, offering a seamless experience for enthusiasts to discover and share their camping and trekking experiences.

Add Campgrounds, review others campgrounds and much more!

## 🚀 Live Application
https://basecampx.onrender.com/

<div style="display: flex; align-items: center; justify-content: space-evenly; flex-wrap: wrap; gap: 1rem">
    <img src="./assets/screenshots/home-page.png" alt="BasecampX Home Page" style="width: 40%; height: auto;">
    <img src="./assets/screenshots/campgrounds-page.png" alt="BasecampX Campgrounds Page" style="width: 40%; height: auto;">
    <img src="./assets/screenshots/single-campground-page.png" alt="BasecampX Single Campground Page" style="width: 40%; height: auto;">
    <img src="./assets/screenshots/register-page.png" alt="BasecampX Register Page" style="width: 40%; height: auto;">
</div>

## 🎯 Features
- **Adventure Listings:** Explore a wide range of treks and camping destinations with detailed descriptions, images, and user reviews.

- **Interactive Maps:** Discover nearby destinations and plan routes with an intuitive map interface.

- **Authentication:** Secure user login and registration with *Passport.js* and *passport-local-mongoose* to manage authentication and user sessions.

- **Campground Reviews:** Users can leave reviews and ratings on campgrounds, helping others make informed decisions based on feedback from the community.

- **Full CRUD Implementation:** Complete CRUD functionality for users to create, read, update, and delete their camps. Reviews can be created, read and deleted directly through the platform.

## 🛠️ Tech Stack
- **Frontend:** Embedded JavaScript (EJS Template), HTML5, CSS3, Bootstrap CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **APIs:** RESTful API design, Cloudinary, Mapbox
- **Hosting:** Render

## ⚙️ Setup and Installation
1. Clone the repository & enter the BaseCampX directory.
```bash
git clone https://github.com/krishnaj01/BaseCampX.git
cd BaseCampX
```
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
*(Create a .env file in the root directory and add the following)*

```
DB_URL=<your-mongodb-connection-string>

CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_KEY=<your-cloudinary-key>
CLOUDINARY_SECRET=<your-cloudinary-secret>

MAPBOX_TOKEN=<your-mapbox-token>

SECRET=<your-secret-string-for-session-and-mongostore>

# used to create seed data
PEXELS_API_KEY=<your-pexels-api-key>
```
4. Run the development server:
```bash
node app.js
```
5. Access the website locally at http://localhost:8080

## 📝 Contribution Guidelines
To contribute:
1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Commit your changes with meaningful commit messages.
4. Push to your fork and submit a pull request.

## 📬 Contact
For any issues or suggestions, contact me at krishnaj@iitbhilai.ac.in