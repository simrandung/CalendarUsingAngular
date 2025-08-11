import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MovieReleaseEvent } from '../movies.model';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { EventDetailsDialogComponent } from '../event-details-dialog/event-details-dialog.component';

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
    MatTableModule
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
  displayedColumns: string[] = ['id', 'title', 'releaseDateTime']

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.dataSource.data = this.events;
    this.loadEventsFromLocalStorage();
    this.loadView();
  }

  /**
   * Loads events everytime from localStorage
   */
  loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem(local_storage)
    if (storedEvents) {
      this.events = JSON.parse(storedEvents).map((event: any) => ({
        ...event,
        releaseDateTime: moment(event.releaseDateTime)
      }));

      this.dataSource.data = this.events;

    } else {
      this.events = [];
      this.dataSource.data = [];
    }
  }

  /**
   * Saves the events to the local Storage in string format
   */
  saveEventsInLocalStorage() {
    localStorage.setItem(local_storage, JSON.stringify(this.events))
  }

  /**
  * Changes view of the calendar when toggeled
  */
  loadView() {
    if (this.activeView === 'month') {
      this.loadCalendar();
    } else if (this.activeView === 'week') {
      this.loadWeek();
    } else if (this.activeView === 'list') {
      this.loadList();
    }
  }

  /**
  * Loads the calendar using all the data present in calendarData array
  */
  loadCalendar() {
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
          events: this.getEventsForDay(currentDay)
        });
        day.add(1, 'day');
      }
      this.calendarData.push(week);
    }
    this.selectedDayEvents = this.getEventsForDay(this.currentDate);
  }

  /**
  * loads week data from calendarData array
  */
  loadWeek() {
    this.calendarData = [];
    const startOfWeek = this.currentDate.clone().startOf('week');
    const week = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      week.push({
        date: currentDay,
        events: this.getEventsForDay(currentDay)
      });
    }
    this.calendarData.push(week);
    this.selectedDayEvents = this.getEventsForDay(this.currentDate);
  }

  /**
  * Loads particular day events using currentDate
  */
  loadDay() {
    this.selectedDayEvents = this.getEventsForDay(this.currentDate);
  }

  /**
   * Loads all data into datasource and visible in table
   */
  loadList() {
    this.dataSource.data = this.events
  }

  /**
  * @param date of moment type, of the MovieReleaseEvent interface
  * @returns events for each day by sorting according to the time
  */
  getEventsForDay(date: moment.Moment): MovieReleaseEvent[] {
    const eventsForDay = this.events.filter(event =>
      moment(event.releaseDateTime).isSame(date, 'day')
    );
    return eventsForDay.sort((a, b) => a.releaseDateTime.diff(b.releaseDateTime));
  }

  /**
  * Gives data of previous Month by subtracting 1 from current Date's Month
  */
  previousMonth() {
    this.currentDate = this.currentDate.subtract(1, 'month');
    this.loadCalendar();
  }

  /**
  * Gives data of next month by adding 1 to current Date's month
  */
  nextMonth() {
    this.currentDate = this.currentDate.add(1, 'month');
    this.loadCalendar();
  }

  /**
  * Gives data of previous week by subtracting 1 from currentDate's week
  */
  previousWeek() {
    this.currentDate = this.currentDate.subtract(1, 'week');
    this.loadWeek();
  }

  /**
  * Gives data of next week by adding 1 to current date's week
  */
  nextWeek() {
    this.currentDate = this.currentDate.add(1, 'week');
    this.loadWeek();
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
    this.selectedDayEvents = this.getEventsForDay(date);

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
        //console.log(result);
        // const eventExists = this.events.some((event) => {
        //   const existingDate = event.releaseDateTime.clone();
        //   const newDate = result.releaseDateTime.clone();
        //   console.log("Existing event date:", existingDate.format('HH:mm'));
        //   console.log("New event date:", newDate.format('HH:mm'));
        //   console.log("Are dates and times the same?", existingDate.isSame(newDate));
        //   return existingDate.isSame(newDate);
        // });

        // if (eventExists) {
        //   alert('Cannot add event at the same date and time');
        //   return;
        // }
        const a = this.events.some(
          (event)=>{
            //console.log(event.releaseDateTime);
            //console.log(result.releaseDateTime);
            const eventExists = event.releaseDateTime.format() === result.releaseDateTime.format()
            console.log(eventExists)
            //console.log('same time')
             
            //event.releaseDateTime.isSame(result.releaseDateTime)
            //console.log('same too same');
            return eventExists;
          }
        )
        console.log(a);
        if(a){
          alert('Can not add event on same time');
          return;
        }

        result.id = this.events.length > 0 ? Math.max(...this.events.map(e => e.id || 0)) + 1 : 1;
        // const a = this.events.forEach(event => {
        // console.log(event.releaseDateTime);
        // console.log(event.releaseDateTime);
        // console.log(event.title);
        // event.releaseDateTime.format('HH:mm')
        // console.log(event.releaseDateTime.format('HH:mm')); 
        // console.log(result.releaseDateTime.format('HH:mm'));
        // if(event.releaseDateTime.format('HH:mm') === result.releaseDateTime.format('HH:mm')){
        //   console.log('same time');
        //   alert('Can not add on same time'); 
        //   }
        // })
        // console.log(a);
        // this.events.forEach(b=>{
        //    console.log(b.title);   
        // });
        //   console.log(this.events);
        // }
        //   this.events.forEach(event => {
        //    console.log(event.title);
        // })  
        this.events.push(result);
        this.events.sort((a, b) => a.releaseDateTime.diff(b.releaseDateTime),);
        this.dataSource.data = this.events;
        this.saveEventsInLocalStorage();
        this.loadView();
        // console.log(this.events);
        // if(result.releaseDateTime === this.events[0].releaseDateTime){
        //   console.log('same time');
        // }
        //console.log(result);

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
        events: this.getEventsForDay(currentDay)
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
        this.deleteEvent(event.id);
      }
    })
  }

  /**
   * @param eventId matches the id returned from dialogbox event id and delete accordingly
   */
  deleteEvent(eventId: number | undefined): void {
    if (eventId !== undefined) {
      this.events = this.events.filter(event => event.id !== eventId);
      this.dataSource.data = this.events;
      this.saveEventsInLocalStorage();
      this.loadView();
    }
  }
}