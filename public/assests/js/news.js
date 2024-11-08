const generalBtn = document.getElementById("general");
const businessBtn = document.getElementById("business");
const sportsBtn = document.getElementById("sports");
const entertainmentBtn = document.getElementById("entertainment");
const technologyBtn = document.getElementById("technology");
const searchBtn = document.getElementById("searchBtn");

const newsQuery = document.getElementById("newsQuery");
const newsType = document.getElementById("newsType");
const newsdetails = document.getElementById("newsdetails");

let newsDataArr = [];

// Load default news on page load
window.onload = function() {
    newsType.innerHTML = "<h4>Headlines</h4>";
    fetchNews('general'); // Load general news by default
};

// Event listeners for category buttons
generalBtn.addEventListener("click", () => updateNews('general'));
businessBtn.addEventListener("click", () => updateNews('business'));
sportsBtn.addEventListener("click", () => updateNews('sports'));
entertainmentBtn.addEventListener("click", () => updateNews('entertainment'));
technologyBtn.addEventListener("click", () => updateNews('technology'));

// Event listener for search button
searchBtn.addEventListener("click", () => {
    const query = newsQuery.value.trim();
    if (query) {
        newsType.innerHTML = `<h4>Search Results: ${query}</h4>`;
        fetchSearchNews(query);
    } else {
        newsdetails.innerHTML = "<h5>Please enter a search query.</h5>";
    }
});

// Function to fetch news by category
const fetchNews = async (category) => {
    try {
        const response = await fetch(`http://localhost:3000/api/news?category=${category}`); // Changed port to 3000
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Update newsDataArr with the fetched articles
        newsDataArr = data;
        displayNews(); // Call display function
    } catch (error) {
        console.error(error);
        newsdetails.innerHTML = "<h5>Unable to fetch data. Please try again later.</h5>";
    }
};

// Function to fetch news based on search query
const fetchSearchNews = async (query) => {
    try {
        const response = await fetch(`http://localhost:3000/api/news?query=${encodeURIComponent(query)}`); // Changed port to 3000
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Update newsDataArr with the fetched articles
        newsDataArr = data;
        displayNews(); // Call display function
    } catch (error) {
        console.error(error);
        newsdetails.innerHTML = "<h5>No data found.</h5>";
    }
};

// Function to display news on the webpage
function displayNews() {
    newsdetails.innerHTML = ""; // Clear previous content

    if (newsDataArr.length === 0) {
        newsdetails.innerHTML = "<h5>No data found.</h5>";
        return;
    }

    newsDataArr.forEach(news => {
        const date = new Date(news.published_at).toLocaleDateString(); // Formatting date nicely

        const col = document.createElement('div');
        col.className = "col-sm-12 col-md-4 col-lg-3 p-2 card";

        const card = document.createElement('div');
        card.className = "p-2";

        const image = document.createElement('img');
        image.setAttribute("height", "200px");
        image.setAttribute("width", "100%");
        image.src = news.image || "placeholder-image.jpg"; // Fallback for missing images

        const cardBody = document.createElement('div');

        const newsHeading = document.createElement('h5');
        newsHeading.className = "card-title";
        newsHeading.innerHTML = news.title || "No title available"; // Handle missing title

        const dateHeading = document.createElement('h6');
        dateHeading.className = "text-primary";
        dateHeading.innerHTML = date;

        const description = document.createElement('p');
        description.className = "text-muted";
        description.innerHTML = news.description || "No description available"; // Handle missing description

        const link = document.createElement('a');
        link.className = "btn btn-dark";
        link.setAttribute("target", "_blank");
        link.href = news.url || "#"; // Fallback if URL is missing
        link.innerHTML = "Read more";

        cardBody.appendChild(newsHeading);
        cardBody.appendChild(dateHeading);
        cardBody.appendChild(description);
        cardBody.appendChild(link);

        card.appendChild(image);
        card.appendChild(cardBody);

        col.appendChild(card);
        newsdetails.appendChild(col);
    });
}

// Update news type and fetch news
function updateNews(category) {
    newsType.innerHTML = `<h4>${category.charAt(0).toUpperCase() + category.slice(1)} News</h4>`;
    fetchNews(category);
}
