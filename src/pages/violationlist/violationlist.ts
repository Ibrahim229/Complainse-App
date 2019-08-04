import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HTTP, HTTPResponse } from '@ionic-native/http/';
@IonicPage()
@Component({
  selector: 'page-violationlist',
  templateUrl: 'violationlist.html',
})
export class ViolationlistPage {
  issuesList: Array<IssueListItem>;
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public loadingCtrl: LoadingController, public nativHttp: HTTP
  ) {
    this.getIssueList()

  }


  ionViewDidLoad() {
  }
  getData(key: string): Promise<any> {
    return this.storage.get(key);
  }
  async getIssueList() {
    const userData = await this.getData("UserBasicData")
    console.log("My data" + userData);
    const empId = userData.EMPLOYEE_ID;
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });
    loading.present()
    let headers: any;
    headers = {
      "Content-Type": "application/json"
    }
    this.nativHttp.setDataSerializer('json');
    this.nativHttp.get(`http://85.194.99.134:8002/issues/getIssuesByEmpID/${empId}`, {}, headers).then(response => {
      loading.dismiss();
      console.log(response);
      let responseData = JSON.parse(response.data)
      console.log('Json response', responseData)
      if (response != null) {
        this.issuesList = responseData.rows;
        console.log(this.issuesList);
      }

    }, error => {
      loading.dismiss();
      console.log("Service failed");
      console.log(error.status);
      if (error.status && error.status === 401) {
        // this.dialogsProvider.showAlertDialog('Error', 'Your session is expired, please login again');
        let loading = this.loadingCtrl.create({
          content: 'Your session is expired, please login again',
          spinner: "hide"
        });
        loading.present()
        setTimeout(() => {
          loading.dismiss();
        }, 2000);
      }
      else {
        // this.dialogsProvider.showAlertDialog('Error', 'Please check your internet connection');
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
}

