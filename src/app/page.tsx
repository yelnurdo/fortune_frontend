'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';

// Define the API base URL as a constant
const API_BASE_URL = 'https://fortunebackend-production.up.railway.app';

interface UserResponse {
  id: number;
  name: string;
  birthdate: string;
  location: string;
  birth_time: string | null;
  interests: string;
}

interface PredictionResponse {
  id: number;
  type: string;
  result: {
    images: string[];
    text: string;
    audio: string;
  };
}

export default function Home() {
  const [name, setName] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [predictionType, setPredictionType] = useState<string>('love');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const formattedBirthdate = new Date(birthdate).toISOString().split('T')[0];  // Format birthdate to YYYY-MM-DD

      const userResponse = await axios.post<UserResponse>(`${API_BASE_URL}/users/`, {
        name,
        birthdate: formattedBirthdate,
        location,
        birth_time: birthTime,
        interests,
      });

      const userId = userResponse.data.id;

      const predictionResponse = await axios.post<PredictionResponse>(`${API_BASE_URL}/predictions/`, {
        user_id: userId,
        type: predictionType,
        additional_info: { interests }
      });

      setPrediction(predictionResponse.data);
    } catch (error) {
      console.error(error);
      setPrediction(null);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Get Your Prediction</h1>
      </header>
      <section className="section">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name: </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Birthdate: </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Location: </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Birth Time: </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
          </div>
          <div>
            <label>Interests: </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Prediction Type: </label>
            <select value={predictionType} onChange={(e) => setPredictionType(e.target.value)}>
              <option value="love">Love</option>
              <option value="work">Work</option>
              <option value="health">Health</option>
              <option value="spiritual">Spiritual Development</option>
              <option value="happiness">Personal Happiness</option>
              <option value="future">Future Predictions</option>
            </select>
          </div>
          <button type="submit">Get Prediction</button>
        </form>
      </section>
      {prediction && (
        <section className="section">
          <h2>Your Prediction:</h2>
          <div className="grid grid-cols-4 gap-4">
            {prediction.result?.images && prediction.result.images.map((image, index) => (
              <div key={index}>
                <Image src={`${API_BASE_URL}${image}`} alt={`Prediction Image ${index + 1}`} width={500} height={500} />
              </div>
            ))}
          </div>
          <div>
            <p>{prediction.result?.text}</p>
            {prediction.result?.audio && (
              <div>
                <audio controls>
                  <source src={`${API_BASE_URL}${prediction.result.audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
