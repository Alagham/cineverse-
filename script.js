// app.js

// ======== Classes =========
class Movie {
  #rating;

  constructor(title, year, genre, director) {
    this.title = title;
    this.year = year;
    this.genre = genre;
    this.director = director;
    this.#rating = null;
  }

  setRating(rating) {
    if (rating >= 0 && rating <= 10) {
      this.#rating = rating;
    }
  }

  getRating() {
    return this.#rating;
  }

  display() {
    return `
      <h3>${this.title} (${this.year})</h3>
      <p><strong>Genre:</strong> ${this.genre}</p>
      <p><strong>Director:</strong> ${this.director}</p>
      <p><strong>Rating:</strong> ${this.getRating() ?? 'N/A'}</p>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(this.title + ' trailer')}" target="_blank">🎬 Watch Trailer</a>
    `;
  }
}

class ActionMovie extends Movie {
  display() {
    return `
      <h3>🔥 ${this.title} (${this.year})</h3>
      <p><strong>Director:</strong> ${this.director}</p>
      <p><strong>Genre:</strong> ${this.genre} | <strong>Rating:</strong> ${this.getRating() ?? 'N/A'}</p>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(this.title + ' trailer')}" target="_blank">🎬 Watch Trailer</a>
    `;
  }
}

class ComedyMovie extends Movie {
  display() {
    return `
      <h3>😂 ${this.title} (${this.year})</h3>
      <p><strong>Director:</strong> ${this.director}</p>
      <p><strong>Laugh Score:</strong> ${this.getRating() ?? 'N/A'}</p>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(this.title + ' trailer')}" target="_blank">🎬 Watch Trailer</a>
    `;
  }
}

class User {
  constructor(username) {
    this.username = username;
    this.movies = [];
  }

  addMovie(movie) {
    this.movies.push(movie);
  }

  rateMovie(movie, rating) {
    movie.setRating(rating);
  }
}

class Review {
  constructor(user, movie, reviewText) {
    this.user = user;
    this.movie = movie;
    this.reviewText = reviewText;
  }

  display() {
    return `
      <div class="review">
        <p><strong>${this.user.username}</strong> on <em>${this.movie.title}</em>:</p>
        <p>${this.reviewText}</p>
      </div>
    `;
  }
}

// ======== App Logic =========
const API_KEY = "ca05fff1";
const movieInfo = document.getElementById("movieInfo");
const searchBtn = document.getElementById("searchBtn");
const reviewsContainer = document.getElementById("reviewsContainer");
const movieTitleInput = document.getElementById("movieTitle");

let currentMovie = null;
const reviews = [];

searchBtn.addEventListener("click", async () => {
  const title = movieTitleInput.value.trim();
  if (!title || title.length < 3) {
    movieInfo.innerHTML = `<p>Please enter at least 3 characters of a movie title.</p>`;
    movieInfo.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
    const data = await res.json();

    if (data.Response === "True") {
      const genre = data.Genre.split(",")[0];
      const MovieClass = genre.toLowerCase() === "action" ? ActionMovie :
                         genre.toLowerCase() === "comedy" ? ComedyMovie : Movie;

      currentMovie = new MovieClass(data.Title, data.Year, genre, data.Director);
      movieInfo.innerHTML = currentMovie.display();
    } else {
      movieInfo.innerHTML = `<p>❌ Movie not found. Please try the full title (e.g., \"The Matrix\").</p>`;
    }
  } catch (err) {
    movieInfo.innerHTML = `<p>⚠️ Error fetching movie. Check your internet connection or try again.</p>`;
  }

  movieInfo.classList.remove("hidden");
});

const submitReviewBtn = document.getElementById("submitReview");
submitReviewBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const rating = parseFloat(document.getElementById("rating").value);
  const reviewText = document.getElementById("review").value.trim();

  if (!currentMovie || !username || isNaN(rating) || !reviewText) return;

  const user = new User(username);
  user.addMovie(currentMovie);
  user.rateMovie(currentMovie, rating);

  const review = new Review(user, currentMovie, reviewText);
  reviews.push(review);
  renderReviews();
});

function renderReviews() {
  reviewsContainer.innerHTML = '<h2>All Reviews</h2>' +
    reviews.map(r => r.display()).join('');
}
