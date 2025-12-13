import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface CourseFile {
  name: string;
  type: string;
  size: number;
  path: string;
  category: string;
}

@Component({
  selector: 'app-cours-viewer',
  templateUrl: './cours-viewer.component.html',
  styleUrls: ['./cours-viewer.component.css']
})
export class CoursViewerComponent implements OnInit {
  courseNumber: number = 0;
  partNumber: number = 0;
  fileUrl: SafeResourceUrl | null = null;
  showVideo: boolean = false;
  private apiUrl = 'http://localhost:8001/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseNumber = +params['course'];
      this.partNumber = +params['part'];
      this.showVideo = params['showVideo'] === 'true';

      if (this.showVideo) {
        this.loadAndOpenFirstVideo();
      } else {
        this.loadAndOpenFirstPdf();
      }
    });
  }

  loadAndOpenFirstPdf(): void {
    const url = `${this.apiUrl}/courses/${this.courseNumber}/parts/${this.partNumber}/all-files`;

    this.http.get<{ files: CourseFile[] }>(url).subscribe({
      next: (response) => {
        const firstPdf = response.files.find(file =>
          file.type === '.pdf' && file.category === 'Cours'
        );

        if (firstPdf) {
          this.openFile(firstPdf);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des fichiers:', error);
      }
    });
  }

  loadAndOpenFirstVideo(): void {
    const url = `${this.apiUrl}/courses/${this.courseNumber}/parts/${this.partNumber}/all-files`;

    console.log('🎥 Chargement vidéo pour cours', this.courseNumber, 'partie', this.partNumber);

    this.http.get<{ files: CourseFile[] }>(url).subscribe({
      next: (response) => {
        console.log('📂 Fichiers reçus:', response.files);

        // Chercher les vidéos dans la catégorie "Video"
        const videoFile = response.files.find(file =>
          (file.type === '.mp4' || file.type === '.avi' || file.type === '.mkv' || file.type === '.mov' || file.type === '.MP4')
          && file.category === 'Video'
        );

        if (videoFile) {
          console.log('✅ Vidéo trouvée:', videoFile);
          this.openFile(videoFile);
        } else {
          console.error('❌ Aucune vidéo trouvée dans le dossier Video');
          console.log('Types de fichiers disponibles:', response.files.map(f => `${f.name} (${f.type}) [${f.category}]`));
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des fichiers:', error);
      }
    });
  }

  openFile(file: CourseFile): void {
    const url = `${this.apiUrl}/courses/${this.courseNumber}/parts/${this.partNumber}/view/${file.category}/${file.name}`;
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBackToOptions(): void {
    // Retourner vers l'interface avec les 3 options (Cours/Quiz/AI)
    this.router.navigate(['/Cours'], {
      queryParams: {
        course: this.courseNumber,
        part: this.partNumber
      }
    });
  }
}
