import { Component, ViewChild, OnInit, AfterContentInit, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { HomePage } from '../home/home';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';

declare var google;
var map

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage implements OnInit, AfterContentInit {
  ngOnInit(): void {
    window["angularComponentRef"] = { component: this, zone: this._ngZone };
  }
  Zones = [
  ];
  Zone = [];
  @ViewChild("mapElement") MapElement;

  getAssets(num) {
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()
    this.http.get(`http://172.16.35.2:8002/getZones/getZonesById/${num}`).map(res => res.json()).subscribe(data => {
      this.Zone = data.rows
      loading.dismiss();

      console.log(this.Zone)
      let alert = this.alertCtrl.create();
      alert.setTitle('Pick an Asset');
      for (var i = 0; i < this.Zone.length; i++) {
        alert.addInput({
          type: 'radio',
          label: this.Zone[i].ASSET_NAME,
          value: this.Zone[i].ASSET_ID,
        });
      }



      alert.addButton('Cancel');
      alert.addButton({
        text: 'Okay',
        handler: data => {
          console.log(data)
          // console.log(this.Zone.filter(x => x.ASSET_ID == data)[0].ASSET_GROUP)
          let options: NativeTransitionOptions = {
            direction: 'left',
            duration: 500,
            slowdownfactor: -1,
            slidePixels: 20,
          }

          this.nativePageTransitions.slide(options)
          this.nav.push(HomePage, { "ASSET_ID": data, "ASSET_NAME": this.Zone.filter(x => x.ASSET_ID == data)[0].ASSET_NAME, "ASSET_GROUP": this.Zone.filter(x => x.ASSET_ID == data)[0].ASSET_GROUP })
        }
      });
      alert.present();


    }, (error) => {
      loading.dismiss();

      if (error.status && error.status === 401) {
        let loading = this.loadingCtrl.create({
          content: 'Server Error ',
          spinner: "hide"
        });
        loading.present()
        setTimeout(() => {
          loading.dismiss();
        }, 2000);
      }
      else {
        let loading = this.loadingCtrl.create({
          content: 'Please check your internet connection',
          spinner: "hide"
        });
        loading.present()
        setTimeout(() => {
          loading.dismiss();
        }, 2000);
      }
    })

  }

  ngAfterContentInit() {
    var myLatlng = new google.maps.LatLng(21.422484, 39.826161);
    map = new google.maps.Map(this.MapElement.nativeElement, {
      zoom: 16,
      center: myLatlng,
      mapTypeId: 'satellite',
      disableDefaultUI: true
    });
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()
    this.http.get("http://172.16.35.2:8002/getZones/getAllZones").map(res => res.json()).subscribe(data => {
      console.log(data)
      loading.dismiss();
      this.Zones = data.rows;
      for (var i = 0; i < this.Zones.length; i++) {
        var contentString =
          '</div>' +
          `<h1 id="firstHeading" class="firstHeading">${this.Zones[i].ZONE_NAME_AR}</h1>` +
          '</div>' +
          `<button  style="-moz-box-shadow:inset 0px 1px 0px 0px #31715b;
      -webkit-box-shadow:inset 0px 1px 0px 0px #31715b;
      box-shadow:inset 0px 1px 0px 0px #31715b;
      background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #31715b), color-stop(1, #31715b));
      background:-moz-linear-gradient(top, #31715b 5%, #31715b 100%);
      background:-webkit-linear-gradient(top, #31715b 5%, #31715b 100%);
      background:-o-linear-gradient(top, #31715b 5%, #31715b 100%);
      background:-ms-linear-gradient(top, #31715b 5%, #31715b 100%);
      background:linear-gradient(to bottom, #31715b 5%, #31715b 100%);
      filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#31715b', endColorstr='#31715b',GradientType=0);
      background-color:#31715b;
      -moz-border-radius:6px;
      -webkit-border-radius:6px;
      border-radius:6px;
      border:1px solid #31715b;
      display:inline-block;
      cursor:pointer;
      color:#ffffff;
      font-family:Arial;
      font-size:15px;
      font-weight:bold;
      padding:6px 24px;
      text-decoration:none;
      text-shadow:0px 1px 0px #528ecc;"  onclick="window.angularComponentRef.zone.run(() => {window.angularComponentRef.component.getAssets(${this.Zones[i].ZONE_ID});})">get assets</button>`

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        infowindow.setPosition({ lat: this.Zones[i].LATITUDE, lng: this.Zones[i].LONGITUDE });

        infowindow.open(map)
        // zone.addListener('click', (event) => {

        //   let alert = this.alertCtrl.create();
        //   alert.setTitle('Pick an Asset');

        //   alert.addInput({
        //     type: 'checkbox',
        //     label: 'Asset1',
        //     value: 'Asset1',
        //   });

        //   alert.addInput({
        //     type: 'checkbox',
        //     label: 'Asset2',
        //     value: 'Asset2'
        //   });

        //   alert.addButton('Cancel');
        //   alert.addButton({
        //     text: 'Okay',
        //     handler: data => {
        //       this.callback = this.navParams.get("callback")
        //       this.callback(data).then(() => {
        //         this.nav.pop();
        //       });
        //     }
        //   });
        //   alert.present();

        // });





      }
    }, (error) => {
      console.log(error)
      loading.dismiss();
      if (error.status && error.status === 401) {
        let loading = this.loadingCtrl.create({
          content: 'Server Error ',
          spinner: "hide"

        });
        loading.present()
        setTimeout(() => {
          loading.dismiss();
        }, 2000);
      }
      else {
        let loading = this.loadingCtrl.create({
          content: 'Please check your internet connection',
          spinner: "hide"

        });
        loading.present()
        setTimeout(() => {
          loading.dismiss();
        }, 2000);
      }
    })


  }
  constructor(public nav: NavController, public navParams: NavParams, private alertCtrl: AlertController, public http: Http, public _ngZone: NgZone, public loadingCtrl: LoadingController, private nativePageTransitions: NativePageTransitions) {

  }

  // ionViewDidEnter() {
  //   this.http.get("http://172.16.35.2:8002/getZones/getAllZones").map(res => res.json()).subscribe(data => {
  //     console.log(data.rows)
  //     this.Zones = data.rows;
  //     for (var i = 0; i++; i <= this.Zones.length()) {
  //       var marker = new google.maps.Marker({
  //         position: { lat: this.Zones.LATITUDE, lng: this.Zones.LONGITUDE },
  //         map: map,

  //       });
  //       var zone = new google.maps.Circle({
  //         strokeColor: '#FF0000',
  //         strokeOpacity: 0.8,
  //         strokeWeight: 2,
  //         fillColor: '#FF0000',
  //         fillOpacity: 0.35,
  //         map: map,
  //         center: { lat: this.Zones.LATITUDE, lng: this.Zones.LONGITUDE },
  //         radius: 500
  //       });
  //       var contentString =
  //         '</div>' +
  //         `<h1 id="firstHeading" class="firstHeading">${this.Zones[i].ZONE_NAME_AR}</h1>` +
  //         '</div>';
  //       var infowindow = new google.maps.InfoWindow({
  //         content: contentString
  //       });
  //       infowindow.open(map, marker)
  //       zone.addListener('click', (event) => {

  //         let alert = this.alertCtrl.create();
  //         alert.setTitle('Pick an Asset');

  //         alert.addInput({
  //           type: 'checkbox',
  //           label: 'Asset1',
  //           value: 'Asset1',
  //           checked: true
  //         });

  //         alert.addInput({
  //           type: 'checkbox',
  //           label: 'Asset2',
  //           value: 'Asset2'
  //         });

  //         alert.addButton('Cancel');
  //         alert.addButton({
  //           text: 'Okay',
  //           handler: data => {
  //             this.callback = this.navParams.get("callback")
  //             this.callback(data).then(() => {
  //               this.nav.pop();
  //             });
  //           }
  //         });
  //         alert.present();

  //       });





  //     }
  //   })



  // }

}
