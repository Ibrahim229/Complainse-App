import { NgModule } from "@angular/core";
import { HttpModule } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import { IonicApp, IonicModule } from "ionic-angular";
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { ProfilePage } from "../pages/profile/profile"
import { ActivityService } from "../services/activity-service";
import { TripService } from "../services/trip-service";
import { WeatherProvider } from "../services/weather";
import { ComplainePage } from "../pages/complaine/complaine";
import { MyApp } from "./app.component";
import { SettingsPage } from "../pages/settings/settings";
import { CheckoutTripPage } from "../pages/checkout-trip/checkout-trip";
import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { NotificationsPage } from "../pages/notifications/notifications";
import { RegisterPage } from "../pages/register/register";
import { SearchLocationPage } from "../pages/search-location/search-location";
import { TripDetailPage } from "../pages/trip-detail/trip-detail";
import { TripsPage } from "../pages/trips/trips";
import { LocalWeatherPage } from "../pages/local-weather/local-weather";
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@ionic-native/camera';
import { MapPage } from "../pages/map/map";
import { ViolationlistPage } from "../pages/violationlist/violationlist";
import { DatePipe } from '@angular/common'
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
// import services
// end import services
// end import services

// import pages
// end import pages

@NgModule({
  declarations: [
    MyApp,
    SettingsPage,
    ProfilePage,
    CheckoutTripPage,
    HomePage,
    ViolationlistPage,
    LoginPage,
    ComplainePage,
    LocalWeatherPage,
    NotificationsPage,
    RegisterPage,
    SearchLocationPage,
    TripDetailPage,
    TripsPage,
    MapPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false
    }),
    IonicStorageModule.forRoot({
      name: "Compliance app",
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingsPage,
    ProfilePage,
    CheckoutTripPage,
    HomePage,
    LoginPage,
    LocalWeatherPage,
    NotificationsPage,
    RegisterPage,
    SearchLocationPage,
    TripDetailPage,
    TripsPage,
    ComplainePage,
    MapPage,
    ViolationlistPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    ActivityService,
    TripService,
    WeatherProvider,
    File,
    FileTransfer,
    Camera,
    HTTP,
    DatePipe,
    NativePageTransitions

  ]
})

export class AppModule {
}
