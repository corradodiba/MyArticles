import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: './error.component.html'
})

export class ErrorComponent {
  title = 'An error Occured!';

  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {}
}