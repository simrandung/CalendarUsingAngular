import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as moment from 'moment';
import { MovieReleaseEvent } from '../movies.model'; 
import { CommonModule } from '@angular/common'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { MatMomentDateModule } from '@angular/material-moment-adapter'; 

@Component({
  selector: 'app-add-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatMomentDateModule 
  ],
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.css']
})
export class AddEventDialogComponent {
  eventForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: moment.Moment },
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: [data.date.clone(), Validators.required], 
      time: [data.date.format('HH:mm'), Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    console.log();
    
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const selectedDate: moment.Moment = formValue.date; 
      const selectedTime = moment(formValue.time, 'HH:mm'); 
      
      const releaseDateTime = selectedDate.clone().hour(selectedTime.hour()).minute(selectedTime.minute());
      console.log(selectedTime.hour);
      
      
    
      const newEvent: MovieReleaseEvent = {
        title: formValue.title,
        releaseDateTime: releaseDateTime
      };
      
      this.dialogRef.close(newEvent);
    }
  }
}
