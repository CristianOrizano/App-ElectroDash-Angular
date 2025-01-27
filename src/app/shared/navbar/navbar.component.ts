import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { Router, RouterOutlet } from '@angular/router';
import { PrimeModule } from '../prime/prime.module';
import { AuthService } from '@/modules/auth/infraestructure/auth.service';
import { LoginResponse } from '@/modules/auth/domain/auth.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [PrimeModule, RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  auth!: LoginResponse | null;

  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  logout() {
    this.router.navigate(['login']);
    this.authService.removeAuthorization();
  }

  ngOnInit() {
    this.auth = this.authService.getAuthorization();
  }
}
