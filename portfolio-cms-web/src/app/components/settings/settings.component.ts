import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settings!: AppSettings;
  saved = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings = { ...this.settingsService.settings };
  }

  onSave(): void {
    this.settingsService.saveSettings(this.settings);
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
