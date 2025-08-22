import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MovieReleaseEvent } from '../movies.model';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { EventDetailsDialogComponent } from '../event-details-dialog/event-details-dialog.component';
import { EventsService } from '../service/events.service';

const local_storage = 'movieReleaseEvents';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatTableModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  events: MovieReleaseEvent[] = [];
  currentDate: moment.Moment = moment();
  calendarData: any[] = [];
  selectedDayEvents: MovieReleaseEvent[] = [];
  activeView: 'month' | 'week' | 'list' = 'month';

  dataSource = new MatTableDataSource<MovieReleaseEvent>(this.events)
  displayedColumns: string[] = ['id', 'title', 'displayDateTime','genre']

  availableGenres: string[] = []
  selectedGenre:string = 'All'

  constructor(private dialog: MatDialog, private eventService: EventsService) { }

  ngOnInit(): void {
    this.loadEvents(); // Call loadEvents which uses the service
    this.extractGenres();
    this.loadView();
  }

  /**
   * Used to extract the particular genre and store in availableGenres array
   */
  extractGenres() {
    this.availableGenres = [...new Set(this.events.map(event=> event.genre))]
  }

  /**
   * 
   * @returns Selected genres events
   */

  filterEventsByGenres(): MovieReleaseEvent[]{
    if(this.selectedGenre === 'All'){
      return this.events
    }
    else{
      return this.events.filter(event => event.genre === this.selectedGenre);
    }
  }

  /**
   * Loads the view on change of genres
   */
  onGenreFilterChange(){
    this.loadView();
  }
/**
   * Loads events from the backend via EventService
   */
  loadEvents() {
    this.eventService.getEvents().subscribe(
      (events: MovieReleaseEvent[]) => {
        this.events = events;
        this.dataSource.data = this.events;
        this.extractGenres(); // Re-extract genres after loading new data
        this.loadView();
      },
      error => {
        console.error('Error loading events:', error);
        // Handle error, e.g., show a message to the user
      }
    );
  }

  /**
   * Saves the events to the local Storage in string format
   */
  // saveEventsInLocalStorage() {
  //   localStorage.setItem(local_storage, JSON.stringify(this.events))
  // }

  /**
  * Changes view of the calendar when toggeled
  */
  loadView() {
    const filteredEvents = this.filterEventsByGenres();
    if (this.activeView === 'month') {
      this.loadCalendar(filteredEvents);
    } else if (this.activeView === 'week') {
      this.loadWeek(filteredEvents);
    } else if (this.activeView === 'list') {
      this.loadList(filteredEvents);
    }
  }

  /**
  * Loads the calendar using all the data present in calendarData array
  */
  loadCalendar(eventsToDisplay: MovieReleaseEvent[]) {
    this.calendarData = [];
    const startOfMonth = this.currentDate.clone().startOf('month');
    const endOfMonth = this.currentDate.clone().endOf('month');
    const startDay = startOfMonth.clone().startOf('week');
    let day = startDay.clone();
    while (day.isSameOrBefore(endOfMonth, 'day') || day.day() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = day.clone();
        week.push({
          date: currentDay,
          events: this.getEventsForDay(currentDay,eventsToDisplay)
        });
        day.add(1, 'day');
      }
      this.calendarData.push(week);
    }
    this.selectedDayEvents = this.getEventsForDay(this.currentDate,eventsToDisplay);
  }

  /**
  * loads week data from calendarData array
  */
  loadWeek(eventsToDisplay: MovieReleaseEvent[]) {
    this.calendarData = [];
    const startOfWeek = this.currentDate.clone().startOf('week');
    const week = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      week.push({
        date: currentDay,
        events: this.getEventsForDay(currentDay,eventsToDisplay)
      });
    }
    this.calendarData.push(week);
    this.selectedDayEvents = this.getEventsForDay(this.currentDate,eventsToDisplay);
  }

  /**
  * Loads particular day events using currentDate
  */
  loadDay() {
    this.selectedDayEvents = this.getEventsForDay(this.currentDate,this.filterEventsByGenres());
  }

  /**
   * Loads all data into datasource and visible in table
   */
  loadList(eventsToDisplay: MovieReleaseEvent[]) {
        this.dataSource.data = eventsToDisplay.map(event => ({
        ...event,
        displayDateTime: event.releaseDateTime.local().format('YYYY-MM-DD HH:mm') // Format for display
    }));

  }

  /**
  * @param date of moment type, of the MovieReleaseEvent interface
  * @returns events for each day by sorting according to the time
  */
  getEventsForDay(date: moment.Moment, eventsToUse: MovieReleaseEvent[]): MovieReleaseEvent[] {
    const eventsForDay = eventsToUse.filter(event =>
      moment(event.releaseDateTime).isSame(date.utc(), 'day')
    );
    return eventsForDay.sort((a, b) => a.releaseDateTime.diff(b.releaseDateTime));
  }

  /**
  * Gives data of previous Month by subtracting 1 from current Date's Month
  */
  previousMonth() {
    this.currentDate = this.currentDate.subtract(1, 'month');
    this.loadCalendar(this.filterEventsByGenres());
  }

  /**
  * Gives data of next month by adding 1 to current Date's month
  */
  nextMonth() {
    this.currentDate = this.currentDate.add(1, 'month');
    this.loadCalendar(this.filterEventsByGenres());
  }

  /**
  * Gives data of previous week by subtracting 1 from currentDate's week
  */
  previousWeek() {
    this.currentDate = this.currentDate.subtract(1, 'week');
    this.loadWeek(this.filterEventsByGenres());
  }

  /**
  * Gives data of next week by adding 1 to current date's week
  */
  nextWeek() {
    this.currentDate = this.currentDate.add(1, 'week');
    this.loadWeek(this.filterEventsByGenres());
  }

  /**
   * Gives data of previous day by subtracting 1 from current date's day 
  */
  previousDay() {
    this.currentDate = this.currentDate.subtract(1, 'day');
    this.loadDay();
  }

  /**
   * Gives data of next day by adding 1 to current date's day
  */
  nextDay() {
    this.currentDate = this.currentDate.add(1, 'day');
    this.loadDay();
  }

  /**
   * @param date adds data to particular moment's/ events of that date
  */
  dayClicked(date: moment.Moment) {
    this.currentDate = date.clone();
    this.selectedDayEvents = this.getEventsForDay(date,this.filterEventsByGenres());

  }

  /**
   * opens dialog box
  */
  openAddEventDialog(): void {
    this.addEvent(this.currentDate.clone());
  }

  /**
   * @param date of moment type,adds data to dialog box for adding new event to the array
  */
  addEvent(date: moment.Moment): void {
     const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '800px',
      data: { date: date.clone() },
    });
    dialogRef.afterClosed().subscribe((result: MovieReleaseEvent) => {
      if (result) {
        this.eventService.addEvent(result).subscribe(
          (newEvent: MovieReleaseEvent) => {
            this.events.push(newEvent); // Add the newly created event to the local array
            this.loadEvents(); // Reload events to update all views
          },
          error => {
            console.error('Error adding event:', error);
            // Handle error, show a toast message etc.
          }
        );
      }
    });
  }


  /**
   * @param view works with toggle buttons and changes view accordingly
  */
  changeView(view: 'month' | 'week' | 'list') {
    this.activeView = view;
    this.loadView();
  }

  /**
  * @returns names of weekdays from moment library
  */
  getDayNames(): string[] {
    return moment.weekdays();
  }

  /**
   * @param date of type moment 
   * @returns boolean value of current month
  */
  isSameMonth(date: moment.Moment): boolean {
    return date.isSame(this.currentDate, 'month');
  }

  /**
   * @param date of type boolean
   * @returns boolean value of Today's day(T/F)
  */
  isToday(date: moment.Moment): boolean {
    return date.isSame(moment(), 'day');
  }

  /** 
   * @param date of moment type, events of moviereleaseevent array
   * @returns weekday's pushed values 
  */
  getWeekDays(date: moment.Moment): { date: moment.Moment, events: MovieReleaseEvent[] }[] {
    const startOfWeek = date.clone().startOf('week');
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      weekDays.push({
        date: currentDay,
        events: this.getEventsForDay(currentDay,this.filterEventsByGenres())
      });
    }
    return weekDays;
  }

  /**
   * Dialogbox for opening details of an event and delete option
  */
 openEventDetailDialog(event: MovieReleaseEvent): void {
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      width: '400px',
      data: { event: event }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        // Check if event.id exists before passing to deleteEvent
        if (event.id !== undefined && event.id !== null) {
          this.deleteEvent(event.id); // <<<< Now this is correct
        } else {
          console.error('Attempted to delete an event with no ID from Event Details Dialog.');
          alert('Cannot delete event without a valid ID.');
        }
      }
    })
  }

  deleteEvent(eventId: number): void { // Change type from MovieReleaseEvent to number
    // No need for eventToDelete.id, directly use eventId
    if (confirm(`Are you sure you want to delete this event?`)) { // Confirmation message might need to be more generic now
      if (eventId !== undefined && eventId !== null) { // Check for undefined/null ID
        this.eventService.deleteEvent(eventId).subscribe( // Pass eventId directly
          () => {
            // Remove the deleted event from the local array
            this.events = this.events.filter(event => event.id !== eventId);
            this.dataSource.data = this.events; // Update MatTableDataSource
            this.extractGenres(); // Re-extract genres if an event was removed
            this.loadView(); // Refresh the calendar view
            console.log(`Event with ID ${eventId} deleted successfully.`);
            // Optionally, show a snackbar message here (e.g., MatSnackBar)
          },
          error => {
            console.error('Error deleting event:', error);
            alert(`Failed to delete event: ${error.message || 'Unknown error'}`);
          }
        );
      } else {
        console.error('Cannot delete event: ID is undefined or null.');
        alert('Cannot delete event without a valid ID.');
      }
    }
  }
}