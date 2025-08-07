import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
// import { FullCalendarModule } from '@fullcalendar/angular';
//  import dayGridPlugin from '@fullcalendar/daygrid';
// import { CalendarOptions } from '@fullcalendar/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CalendarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'eventSchedular';
  //  calendarOptions: CalendarOptions = {
  //       plugins: [dayGridPlugin],
  //       initialView: 'dayGridMonth',
  //       weekends: true,
  //       events: [
  //         { title: 'My Event', date: '2025-08-10' }
  //       ]
  //     };
}
