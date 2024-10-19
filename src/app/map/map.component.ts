import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { FormsModule } from '@angular/forms';
import shp from 'shpjs';

interface PolygonData {
  name: string;
  color: string;
  coordinates: number[][];
  layer: L.Polygon;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  private map!: L.Map;
  private drawnItems!: L.FeatureGroup;
  public polygons: PolygonData[] = []; // Массив для хранения полигонов с их метаданными
  public editingPolygonIndex: number | null = null; // Индекс редактируемого полигона
  public polygonForm = { name: '', color: '#0000FF' }; // Форма для редактирования полигона

  constructor() { }

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [47.3277, 5.2013],
      zoom: 12,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,

        })
      ]
    });

    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: {
        polygon: {
          shapeOptions: {
            color: this.polygonForm.color
          }
        }
      }
    });

    this.map.addControl(drawControl);

    this.setupGeolocation();
    this.setupDrawingEvents();
  }

  private setupGeolocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.map.setView([lat, lng], 12);
          L.marker([lat, lng]).addTo(this.map)
            .bindPopup('Ты здесь!')
            .openPopup();
        },
        (error) => {
          console.error('Error getting location', error);
          this.map.setView([47.3277, 5.2013], 12);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
      this.map.setView([47.3277, 5.2013], 12);
    }
  }
  private setupDrawingEvents(): void {
    this.map.on(L.Draw.Event.CREATED, (event) => {
      const createdEvent = event as L.DrawEvents.Created;
      const layer = createdEvent.layer;

      this.drawnItems.addLayer(layer);

      if (createdEvent.layerType === 'polygon' && layer instanceof L.Polygon) {
        const coords = layer.getLatLngs();
        const latlngs = (coords as L.LatLng[][]).flat().map(latlng => [latlng.lat, latlng.lng]);

        const polygonData: PolygonData = {
          name: `Polygon ${this.polygons.length + 1}`,
          color: this.polygonForm.color,
          coordinates: latlngs,
          layer: layer
        };

        // Привязываем название полигона к слою
        layer.bindPopup(polygonData.name);

        this.polygons.push(polygonData);

        layer.setStyle({ color: this.polygonForm.color });

        layer.on('remove', () => {
          this.removePolygon(latlngs);
        });
      }
    });
  }

  // Метод для удаления полигона из списка
  private removePolygon(latlngs: number[][]): void {
    const index = this.polygons.findIndex(polygon =>
      JSON.stringify(polygon.coordinates) === JSON.stringify(latlngs)
    );

    if (index !== -1) {
      this.polygons.splice(index, 1);
    }
  }

  // Открыть форму для редактирования полигона
  editPolygon(index: number): void {
    this.editingPolygonIndex = index;
    const polygon = this.polygons[index];
    this.polygonForm = { name: polygon.name, color: polygon.color };
  }

  // Сохранить изменения полигона
  savePolygonDetails(): void {
    if (this.editingPolygonIndex !== null) {
      const polygon = this.polygons[this.editingPolygonIndex];
      polygon.name = this.polygonForm.name;
      polygon.color = this.polygonForm.color;

      // Обновляем цвет полигона на карте
      polygon.layer.setStyle({ color: polygon.color });

      // Обновляем название полигона на карте
      polygon.layer.bindPopup(polygon.name);

      // Закрыть форму редактирования
      this.editingPolygonIndex = null;
    }
  }


  // Отменить редактирование
  cancelEdit(): void {
    this.editingPolygonIndex = null;
  }

  // Удаление полигона
  deletePolygon(index: number): void {
    const polygon = this.polygons[index];
    this.map.removeLayer(polygon.layer); // Удаляем слой с карты
    this.polygons.splice(index, 1); // Удаляем полигон из массива
  }



  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;
        const geojson = await shp(arrayBuffer);
        this.addGeoJsonLayer(geojson);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  // Добавляем GeoJSON слой на карту
  addGeoJsonLayer(geojson: any): void {
    L.geoJSON(geojson, {
      style: () => ({
        color: '#3388ff',
        weight: 2
      })
    }).addTo(this.map);
  }

}
