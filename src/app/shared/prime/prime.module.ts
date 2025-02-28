import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabViewModule } from 'primeng/tabview';
import { CarouselModule } from 'primeng/carousel';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    CommonModule,
    FormsModule,
    TableModule,
    TabViewModule,
    AccordionModule,
    CarouselModule,
    OverlayPanelModule,
    InputNumberModule,
    ScrollPanelModule,
    DividerModule,
    RadioButtonModule,
    FieldsetModule,
    AutoCompleteModule,
    DropdownModule,
    ConfirmDialogModule,
    InputSwitchModule,
    FileUploadModule,
    SkeletonModule,
    DialogModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    RippleModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SidebarModule,
    StyleClassModule,
    ChartModule,
  ],
})
export class PrimeModule {}
