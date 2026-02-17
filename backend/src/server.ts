import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample movie data
const movies = [
    {
        id: 1,
        title: "The Matrix",
        genre: "Sci-Fi",
        year: 2020,
        description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
        director: "Lana Wachowski, Lilly Wachowski",
        actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"]
    },
    {
        id: 2,
        title: "Inception",
        genre: "Action",
        year: 2021,
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
        poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
        director: "Christopher Nolan",
        actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"]
    },
    {
        id: 3,
        title: "The Shawshank Redemption",
        genre: "Drama",
        year: 2020,
        description: "Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency.",
        poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
        director: "Frank Darabont",
        actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"]
    },
    {
        id: 4,
        title: "The Dark Knight",
        genre: "Action",
        year: 2022,
        description: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
        director: "Christopher Nolan",
        actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"]
    },
    {
        id: 5,
        title: "Interstellar",
        genre: "Sci-Fi",
        year: 2021,
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        poster: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
        director: "Christopher Nolan",
        actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
    },
    {
        id: 6,
        title: "The Hangover",
        genre: "Comedy",
        year: 2022,
        description: "Three friends wake up from a bachelor party in Las Vegas with no memory of the previous night.",
        poster: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=600&fit=crop",
        director: "Todd Phillips",
        actors: ["Bradley Cooper", "Ed Helms", "Zach Galifianakis"]
    },
    {
        id: 7,
        title: "The Conjuring",
        genre: "Horror",
        year: 2023,
        description: "Paranormal investigators work to help a family terrorized by a dark presence in their farmhouse.",
        poster: "https://images.unsplash.com/photo-1574267432644-f413c4a34152?w=400&h=600&fit=crop",
        director: "James Wan",
        actors: ["Patrick Wilson", "Vera Farmiga", "Ron Livingston"]
    },
    {
        id: 8,
        title: "Forrest Gump",
        genre: "Drama",
        year: 2023,
        description: "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.",
        poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
        director: "Robert Zemeckis",
        actors: ["Tom Hanks", "Robin Wright", "Gary Sinise"]
    },
    {
        id: 9,
        title: "Jurassic World",
        genre: "Adventure",
        year: 2024,
        description: "A new theme park built on the original site of Jurassic Park creates a genetically modified hybrid dinosaur.",
        poster: "https://images.unsplash.com/photo-1580130732478-e8de37a7d8e3?w=400&h=600&fit=crop",
        director: "Colin Trevorrow",
        actors: ["Chris Pratt", "Bryce Dallas Howard", "Vincent D'Onofrio"]
    },
    {
        id: 10,
        title: "Guardians of the Galaxy",
        genre: "Adventure",
        year: 2024,
        description: "A group of intergalactic criminals must pull together to stop a fanatical warrior.",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
        director: "James Gunn",
        actors: ["Chris Pratt", "Zoe Saldana", "Dave Bautista"]
    },
    {
        id: 11,
        title: "Superbad",
        genre: "Comedy",
        year: 2023,
        description: "Two co-dependent high school seniors are forced to deal with separation anxiety.",
        poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop",
        director: "Greg Mottola",
        actors: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse"]
    },
    {
        id: 12,
        title: "A Quiet Place",
        genre: "Horror",
        year: 2024,
        description: "In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters.",
        poster: "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400&h=600&fit=crop",
        director: "John Krasinski",
        actors: ["Emily Blunt", "John Krasinski", "Millicent Simmonds"]
    }
];

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/movies', (req: Request, res: Response) => {
    res.json(movies);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});