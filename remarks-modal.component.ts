// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// @Component({
//   selector: 'app-remarks-modal',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './remarks-modal.component.html',
// })
// export class RemarksModalComponent {
//   @Input() remarksList: any[] = [];
//   @Input() activityId!: number;

//   constructor(public activeModal: NgbActiveModal) {}
// }

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RemarksService } from '../remarks.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-remarks-modal',
  standalone: true,
  imports: [CommonModule,
    FormsModule],
  templateUrl: './remarks-modal.component.html',
  styleUrls: ['./remarks-modal.component.css']
})
export class RemarksModalComponent implements OnInit {
  @Input() remarksList: any[] = [];
  @Input() activityId!: number;
  @Input() userId!: number;

  newRemarkText: string = '';

  constructor(public activeModal: NgbActiveModal, private remarksService: RemarksService) { }

  ngOnInit(): void { }

  submitRemark() {
  const remarkText = this.newRemarkText.trim();
  if (!remarkText) return;

  const payload = {
    remarks: remarkText,
    activityId: this.activityId,
    userId: this.userId
  };

  console.log('Submitting remark payload:', payload); // ✅ Add this line

  this.remarksService.addRemark(payload).subscribe({
    next: (res) => {
      this.remarksList.push(res);
      this.newRemarkText = '';
    },
    error: (err) => {
      console.error('Failed to post remark:', err);
      alert('Failed to post remark.');
    }
  });
}

}

