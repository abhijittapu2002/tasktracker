



import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarlayoutComponent } from './sidebarlayout/sidebarlayout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SidebarlayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'STT App';
}
