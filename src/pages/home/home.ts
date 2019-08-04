import { Component, OnInit } from "@angular/core";
import { NavController, NavParams, LoadingController } from "ionic-angular";
import { ComplainePage } from "../complaine/complaine"
import { Http } from "@angular/http";
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {
  ASSET_ID = null;
  ASSET_NAME = null;
  ViolationTypes = [];
  AssetGroupId = null;
  Violations = [];
  VIOLATION_GROUP_ID = null;
  CLASSIFICATION_ID = null;
  violation = null;
  showasset1 = true;
  showasset2 = true;
  activecolor = "red";
  nocolor = "gray";
  assets1
  check = true;
  constructor(public nav: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, private nativePageTransitions: NativePageTransitions) {
  }

  ngOnInit() {
    this.ASSET_ID = this.navParams.get("ASSET_ID")
    this.ASSET_NAME = this.navParams.get("ASSET_NAME")
    this.AssetGroupId = this.navParams.get("ASSET_GROUP")
    console.log("Asset Group: " + this.AssetGroupId)
    this.getViolationsTypes(this.ASSET_ID)
  }


  getViolationsTypes(num) {
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()
    this.http.get(`http://172.16.35.2:8002/assetgroupviolations/getOneassetGroupViolationsByID/291`).map(res => res.json()).subscribe(data => {
      loading.dismiss();
      console.log(data.rows.length)
        this.ViolationTypes = data.rows


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



  ViolationType(selected_value) {
    this.VIOLATION_GROUP_ID = selected_value
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()
    this.http.get(`http://172.16.35.2:8002/violationGroupDetails/getOneViolationDetailsGroups/${this.VIOLATION_GROUP_ID}`).map(res => res.json()).subscribe(data => {
      loading.dismiss();
      console.log(data.rows.length)
      this.Violations = data.rows
      this.showasset2 = false;

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
  compliance() {
    let options: NativeTransitionOptions = {
      direction: 'left',
      duration: 500,
      slowdownfactor: -1,
      slidePixels: 50,
    }

    this.nativePageTransitions.slide(options)
    this.nav.push(ComplainePage, { "CLASSIFICATION_ID": this.CLASSIFICATION_ID, "VIOLATION_ID": this.violation, "VIOLATION_GROUP_ID": this.VIOLATION_GROUP_ID, "ASSET_ID": this.ASSET_ID, "violationValue": this.Violations.filter(x => x.VIOLATION_ID == this.violation)[0].VALUE, "ASSET_GROUP": this.AssetGroupId }
    );
  }
  Violation(selected_value) {
    console.log(selected_value)
    this.CLASSIFICATION_ID = this.Violations.filter(x => x.VIOLATION_ID == selected_value)[0].CLASSIFICATION_ID
    console.log(this.CLASSIFICATION_ID)
    this.violation = selected_value
  }


}

//
