import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentService } from '../services/document.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-document-modal',
  templateUrl: './document-modal.component.html',
  imports: [CommonModule],
})
export class DocumentModalComponent {
  @Input() documents: any[] = [];
  @Output() documentDeleted = new EventEmitter<number>();
  
  previewSrcMap: { [docId: number]: SafeResourceUrl | string | null } = {};
  loadingMap: { [docId: number]: boolean } = {};
  errorMap: { [docId: number]: boolean } = {};
  deletingMap: { [docId: number]: boolean } = {};

  constructor(
    public activeModal: NgbActiveModal,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) { }

  isImageFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.(jpg|jpeg|png|gif)$/i.test(docPath.toLowerCase());
  }

  isPdfFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.pdf$/i.test(docPath.toLowerCase());
  }

  isDocxFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.(doc|docx)$/i.test(docPath);
  }

  isExcelFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.(xls|xlsx)$/i.test(docPath);
  }

  isPptFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.(ppt|pptx)$/i.test(docPath);
  }

  isTextFile(docPath: string | undefined | null): boolean {
    return !!docPath && /\.txt$/i.test(docPath);
  }

  getOfficeViewerUrl(docPath: string): string {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(docPath)}`;
  }

  isPreviewable(docPath: string | undefined | null): boolean {
    return this.isImageFile(docPath) || this.isPdfFile(docPath) || this.isTextFile(docPath);
  }

  extractFileName(path: string | undefined | null): string {
    if (!path) return '';
    const parts = path.split(/[/\\]/); // handles both / and \ separators
    return parts[parts.length - 1];
  }

  previewDocument(doc: any) {
    if (!doc?.docId) return;
    this.loadingMap[doc.docId] = true;
    this.errorMap[doc.docId] = false;
    this.documentService.previewDocument(doc.docId).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.isTextFile(doc.docPath)) {
            // Text file - plain content
            this.previewSrcMap[doc.docId] = e.target.result;
          } else {
            // PDF/Image - convert to safe URL
            const base64Url = e.target.result;
            this.previewSrcMap[doc.docId] = this.sanitizer.bypassSecurityTrustResourceUrl(base64Url);
          }
          this.loadingMap[doc.docId] = false;
        };
        reader.onerror = () => {
          this.errorMap[doc.docId] = true;
          this.loadingMap[doc.docId] = false;
        };
        // Choose read method
        if (this.isTextFile(doc.docPath)) {
          reader.readAsText(blob);
        } else {
          reader.readAsDataURL(blob); // needed for PDF/image
        }
      },
      error: () => {
        this.errorMap[doc.docId] = true;
        this.loadingMap[doc.docId] = false;
      }
    });
  }

  downloadDocument(doc: any) {
    if (!doc?.docId) return;
    this.documentService.downloadDocument(doc.docId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = doc.docPath?.split('.').pop() || 'file';
      a.download = `document_${doc.docId}.${extension}`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteDocument(doc: any) {
    if (!doc?.docId) return;
    
    const fileName = this.extractFileName(doc.docPath);
    const confirmMessage = `Are you sure you want to delete "${fileName}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.deletingMap[doc.docId] = true;
      
      this.documentService.deleteDocument(doc.docId).subscribe({
        next: (response) => {
          console.log('Document deleted successfully:', response);
          this.deletingMap[doc.docId] = false;
          
          // Remove document from local array
          this.documents = this.documents.filter(d => d.docId !== doc.docId);
          
          // Emit event to parent component
          this.documentDeleted.emit(doc.docId);
          
          // Show success message (optional)
          alert('Document deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.deletingMap[doc.docId] = false;
          alert('Failed to delete document. Please try again.');
        }
      });
    }
  }
}
