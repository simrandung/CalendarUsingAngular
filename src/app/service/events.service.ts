// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as moment from 'moment';
import { MovieReleaseEvent } from '../movies.model'; 

interface BackendEventResponse {
  id: number;
  event_name: string;
  genre_name: string;
  event_datetime: string; 
  description?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class EventsService { // Changed name to EventsService for consistency, assume this is what you meant
  private apiUrl = 'http://localhost:8000/events'; 

  constructor(private http: HttpClient) { }

  getEvents(): Observable<MovieReleaseEvent[]> {
    return this.http.get<BackendEventResponse[]>(this.apiUrl).pipe(
      map(data => data.map(event => ({
        id: event.id,
        title: event.event_name, 
        releaseDateTime: moment(event.event_datetime), 
        description: event.description, // <-- Make sure this is present if your backend expects it, or Optional.
        genre: event.genre_name 
      })))
    );
  }

  addEvent(event: MovieReleaseEvent): Observable<MovieReleaseEvent> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const eventToSend = { 
      event_name: event.title, 
      // This is the crucial change:
      event_datetime: event.releaseDateTime.utc().toISOString(), // <<<< CHANGE THIS LINE
      // description: event.description, // <-- Uncomment if 'description' is part of your backend model
      genre_name: event.genre 
    };
    console.log("Sending payload:", eventToSend); // This log will now show the correct field name
    console.log("Sending Payload to FastAPI:", eventToSend); // <<<<< ADD THIS LOG
    console.log("Original Moment Object:", event.releaseDateTime.format()); // <<<<< ADD THIS LOG
    console.log("Converted UTC String:", event.releaseDateTime.utc().toISOString()); // <<<<< ADD THIS LOG
    
    
    return this.http.post<BackendEventResponse>(this.apiUrl + '/', eventToSend, { headers }).pipe(
      map(newEvent => ({
        id: newEvent.id,
        title: newEvent.event_name,
        releaseDateTime: moment.utc(newEvent.event_datetime),
        description: newEvent.description, // <-- Uncomment if you expect it back
        genre: newEvent.genre_name
      }))
    );
  }

  getEventById(id: number): Observable<MovieReleaseEvent> {
    return this.http.get<BackendEventResponse>(`${this.apiUrl}/${id}`).pipe(
      map(event => ({
        id: event.id,
        title: event.event_name,
        releaseDateTime: moment(event.event_datetime),
        description: event.description, // <-- Uncomment if expected
        genre: event.genre_name
      }))
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
