import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController } from "ionic-angular";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Validators, FormGroup, FormControl, } from '@angular/forms';
import { HTTP } from '@ionic-native/http';
import { ActionSheetController } from 'ionic-angular'
import { ViolationlistPage } from "../violationlist/violationlist"
import { Http } from '@angular/http';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common'
import { DomSanitizer } from '@angular/platform-browser';
import { ToastController } from 'ionic-angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';

@Component({
  selector: 'page-complaine',
  templateUrl: 'complaine.html'
})
export class ComplainePage implements OnInit {
  @Output() value = new EventEmitter();
  photo: any;
  CLASSIFICATION_ID = null;
  createIssueForm: FormGroup;
  customFieldsForm: FormGroup;
  violationCustomFields: Array<CustomField>;
  issueSubClassId: string;
  violationGroupId: string;
  AssetGroupId: string
  assetId: string;
  base64Image: string;
  violationValue: string;
  ViolationId: string;
  assetOwnerId: string;
  violationIssues: Array<ViolationIssue>;
  userToken;

  validations = {
    'title': [
      { type: 'required', message: 'Title is required.' },
      { type: 'minlength', message: 'Title must be at least 5 characters long.' },
      { type: 'maxlength', message: 'Username cannot be more than 25 characters long.' },
      { type: 'pattern', message: 'Your username must contain only numbers and letters.' },
      { type: 'usernameNotAvailable', message: 'Your username is already taken.' }
    ],
    'summary': [
      { type: 'required', message: 'Summary is required.' }
    ],
    'lastname': [
      { type: 'required', message: 'Last name is required.' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'phone': [
      { type: 'required', message: 'Phone is required.' },
      { type: 'invalidCountryPhone', message: 'Phone is incorrect for the selected country.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase and one number.' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Password confirmation is required.' }
    ],
    'matching_passwords': [
      { type: 'areNotEqual', message: 'Password mismatch' }
    ],
    'guests': [
      { type: 'rangeError', message: 'Number must be between: ' }
    ],
    'bedrooms': [
      { type: 'rangeError', message: 'Number must be between: ' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions.' }
    ]
  };
  ngOnInit() {
    this.createIssueForm = new FormGroup({
      'title': new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
      'summary': new FormControl('', Validators.required),
    });
    this.CLASSIFICATION_ID = this.navParams.get("CLASSIFICATION_ID")
    console.log(this.CLASSIFICATION_ID)
    this.ViolationId = this.navParams.get("VIOLATION_ID")
    console.log("Violation Id" + this.ViolationId)
    this.assetId = this.navParams.get("ASSET_ID")
    this.violationValue = this.navParams.get("violationValue")
    console.log(this.violationValue + "  this is violation value ")
    this.violationGroupId = this.navParams.get("VIOLATION_GROUP_ID")
    this.AssetGroupId = this.navParams.get("ASSET_GROUP")
    console.log("this is ASSET_GROUP in Complaine :" + this.AssetGroupId)
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()

    this.http.get(`http://85.194.99.134:8002/customfieldJoinissuesubclasscustom/getCustomfieldsJoinIssuesCustom/${this.CLASSIFICATION_ID}`).map(res => res.json()).subscribe(data => {
      loading.dismiss();
      console.log("this is  custom fielsd" + data.rows)
      if (data != null) {
        this.violationCustomFields = data.rows;
        console.log(this.violationCustomFields);
        this.issueSubClassId = this.violationCustomFields[0] ? this.violationCustomFields[0].ISSUES_SUB_CLASS_ID : null;
        for (var field of this.violationCustomFields) {
          this.validations[field.FIELD_NAME] = [
            { type: 'required', message: 'This field is required.' },
            { type: 'maxlength', message: `This field cannot be more than ${field.FIELD_WIDH} characters long.` },
          ];
          this.createIssueForm.addControl(field.FIELD_NAME, new FormControl('', Validators.compose([
            Validators.maxLength(field.FIELD_WIDH),
            Validators.minLength(1),
            Validators.required
          ])));
        }
        console.log("this is customform" + this.createIssueForm);
        console.log(this.validations);
      }

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
    this.getUserToken().then(token => {
      this.userToken = token;
    });
    this.getAssetDifinition(this.assetId);
    this.getViolationIssues(this.ViolationId);

  }
  getUserToken(): Promise<any> {
    return this.storage.get("token");
  }
  runService(url: string, method: string, requireToken?: boolean, request?: any, specialHeaders?: any): Promise<any> {
    console.log(url);
    let headers: any;

    if (specialHeaders) {
      headers = specialHeaders;
    }
    else {
      headers = {
        "Content-Type": "application/json"
      }
      if (requireToken) {
        headers.token = this.userToken;
      }
    }
    let requestOptions: any = {
      method: method,
      body: request,
      headers: headers
    }
    // const options = {
    //   method: 'post',
    //   data: { id: 12, message: 'test' },
    //   headers: { Authorization: 'OAuth2: token' }
    // };
    this.nativHttp.setDataSerializer('json');
    if (method === "GET") {
      return this.nativHttp.get(url, {}, headers);
    }
    else {
      return this.nativHttp.post(url, request, headers);
    }
    // return this.nativHttp.sendRequest(url, requestOptions);

  }
  getData(key: string): Promise<any> {
    return this.storage.get(key);
  }
  async onSubmit(values) {
    this.createIssue(values);
  }

  async createIssue(formValue: any) {
    if (this.photo) {

      let loading = this.loadingCtrl.create({
        spinner: 'dots',
        cssClass: 'transparent'
      });

      loading.present()
      try {
        let userData = await this.getData("UserBasicData");
        console.log("My data" + userData.EMPLOYEE_ID);
        let request = {
          "REQUEST_TYPE": 67,
          "DESCRIPTION": this.createIssueForm.value.title,
          "DELETED": 0,
          "SUBSIDIARY_ID": null,
          "CLASSIFICATION_ID": 11,
          "EMPLOYEE_ID": userData.EMPLOYEE_ID
        };
        let initWorkFlowResponse = await this.runService("http://85.194.99.134:8001/requests/newrequest", "POST", false, request);
        if (initWorkFlowResponse.data != null) {
          let responseData = JSON.parse(initWorkFlowResponse.data);
          console.log('Intialize work flow response', responseData);
          let finalRequest = this.getCreateIssueRequest(responseData.rows.R_REQUEST_ID, formValue, userData.EMPLOYEE_ID);
          console.log("Run new action request");
          let newActionRequest = {
            "REQUEST_ID": parseInt(responseData.rows.R_REQUEST_ID),
            "ACTION_ID": 1,
            "FROM_DESTINATION_ID": 459,
            "COMMENT": ""
          };
          console.log(newActionRequest);
          let newActionResponse = await this.runService("http://85.194.99.134:8001/newactions/takenewaction", "POST", false, newActionRequest);
          console.log(newActionResponse);
          console.log("Insert issue request");
          console.log(finalRequest);
          console.log(JSON.stringify(finalRequest));
          const response = await this.runService("http://172.16.35.2:8002/issues/insertIssue", "POST", false, finalRequest);
          console.log(response);
          if (response.data != null) {
            let createIssueResponseData = JSON.parse(response.data);
            let issueId = createIssueResponseData.rows.R_ISSUE_ID
            const assignIssueRequest = this.getAssignmentRequest(issueId, this.assetOwnerId);
            const assignIssueResponse = await this.runService("http://172.16.35.2:8002" + "/issues/insertNewIssueAssignments", "POST", false, assignIssueRequest);
            console.log("Assign issue response");
            console.log(assignIssueResponse.data);
            const uploadImageResponse = await this.uploadIssueImage(issueId);
            console.log(uploadImageResponse)
            if (uploadImageResponse.data != null && assignIssueResponse.data != null) {
              console.log("test1")
              if (this.violationIssues && this.violationIssues.length > 0) {
                console.log("test1")

                for (let i = 0; i < this.violationIssues.length; i++) {
                  let isDone = await this.createIssueForCompliance(this.violationIssues[i], formValue);
                  console.log(isDone)
                  if (isDone) {
                    continue;
                  }
                  else {
                    break;
                  }
                }
              }
              loading.dismiss();
              let toast = this.toastCtrl.create({
                message: 'Created issue successfully',
                duration: 3000,
                position: 'top'
              });
              toast.present();
              let options: NativeTransitionOptions = {
                direction: 'right',
                duration: 500,
                slowdownfactor: -1,
                slidePixels: 20,
              }

              this.nativePageTransitions.slide(options)
              this.nav.setRoot(ViolationlistPage)
            }
            else {
              loading.dismiss();
              let toast = this.toastCtrl.create({
                message: 'Something wrong happened',
                duration: 3000,
                position: 'top'
              });


              toast.present();
            }
          }
          else {
            loading.dismiss();
            let loading1 = this.loadingCtrl.create({
              content: "Something wrong happened",
              spinner: "hide"
            });
            loading1.present()
            setTimeout(() => {
              loading1.dismiss();
            }, 2000);

          }
        }
        else {
          loading.dismiss();
          let loading1 = this.loadingCtrl.create({
            content: "Something wrong happened",
            spinner: "hide"
          });
          loading1.present()
          setTimeout(() => {
            loading1.dismiss();
          }, 2000);
        }
      }
      catch (err) {
        loading.dismiss();
        console.log(err);
        let loading1 = this.loadingCtrl.create({
          content: "Something wrong happened",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);
      }
    }
    else {
      let loading1 = this.loadingCtrl.create({
        content: "Please capture image for issue",
        spinner: "hide"
      });
      loading1.present()
      setTimeout(() => {
        loading1.dismiss();
      }, 2000);

    }
  }

  getCreateIssueRequest(requestId: string, formValue: any, empId: string) {
    let request: any = {
      "REQUEST_ID": parseInt(requestId),
      "ISSUE_TITLE": formValue.title,
      "ISSUE_SUMMARY": formValue.summary,
      "ISSUE_PRIORITY": 2,
      "ASSIGN_TO": 93,
      "TARGET_RESOLUTION_DATE": "5 - JULY - 1995",
      "ACTUAL_RESOLUTION_DATE": null,
      "READ_STATUS": 1,
      "REFERENCE_ID": 6436,
      "ISSUE_TRACK_ID": null,
      "ISSUE_TYPE": null,
      "FINAL_RESOLUTION": "test",
      "PROJECT_ID": null,
      "CREATED_WO": null,
      "SUBSIDIARY_ID": null,
      "CLASSIFICATION": 265,
      "TYPE_ID": 12274,
      "ISSUE_SUB_CLASS": this.issueSubClassId != null ? parseInt(this.issueSubClassId) : null,
      "ISSUE_LOCATION": null,
      "ISSUE_SHIFT": null,
      "TOOL": null,
      "REQUIRE_REPORT": null,
      "ISSUE_STATE": null,
      "ISSUE_NOTE": null,
      "CUSTOM_FIELD_CHAR1": null,
      "CUSTOM_FIELD_CHAR2": null,
      "CUSTOM_FIELD_CHAR3": null,
      "CUSTOM_FIELD_CHAR4": null,
      "CUSTOM_FIELD_CHAR5": null,
      "CUSTOM_FIELD_NUMBER1": null,
      "CUSTOM_FIELD_NUMBER2": null,
      "CUSTOM_FIELD_NUMBER3": null,
      "CUSTOM_FIELD_NUMBER4": null,
      "CUSTOM_FIELD_NUMBER5": null,
      "CUSTOM_FIELD_DATE1": null,
      "CUSTOM_FIELD_DATE2": null,
      "CUSTOM_FIELD_DATE3": null,
      "CUSTOM_FIELD_DATE4": null,
      "CUSTOM_FIELD_DATE5": null,
      "CUSTOM_FIELD_LIST1": null,
      "CUSTOM_FIELD_CHAR6": null,
      "CUSTOM_FIELD_CHAR7": null,
      "CUSTOM_FIELD_CHAR8": null,
      "CUSTOM_FIELD_CHAR9": null,
      "CUSTOM_FIELD_CHAR10": null,
      "CUSTOM_FIELD_CHAR11": null,
      "CUSTOM_FIELD_CHAR16": null,
      "CUSTOM_FIELD_CHAR17": null,
      "CUSTOM_FIELD_CHAR12": null,
      "ASSEET_ID": parseInt(this.assetId),
      "CUSTOM_FIELD_CHAR13": null,
      "CUSTOM_FIELD_CHAR14": null,
      "CUSTOM_FIELD_CHAR15": null,
      "CUSTOM_FIELD_CHAR18": null,
      "CUSTOM_FIELD_CHAR19": null,
      "EMPLOYEE_ID": parseInt(empId),
      "CUSTOM_FIELD_CHAR20": null,
      "CUSTOM_FIELD_DATE9": null,
      "CUSTOM_FIELD_DATE11": null,
      "CUSTOM_FIELD_DATE12": null,
      "CUSTOM_FIELD_DATE13": null,
      "CUSTOM_FIELD_DATE14": null,
      "CUSTOM_FIELD_DATE15": null,
      "CUSTOM_FIELD_DATE16": null,
      "CUSTOM_FIELD_DATE17": null,
      "CUSTOM_FIELD_DATE18": null,
      "CUSTOM_FIELD_DATE19": null,
      "CUSTOM_FIELD_DATE20": null,
      "CUSTOM_FIELD_DATE10": null,
      "CUSTOM_FIELD_DATE6": null,
      "CUSTOM_FIELD_DATE7": null,
      "CUSTOM_FIELD_DATE8": null,
      "CUSTOM_FIELD_NUMBER6": null,
      "CUSTOM_FIELD_NUMBER7": null,
      "CUSTOM_FIELD_NUMBER8": null,
      "CUSTOM_FIELD_NUMBER9": null,
      "CUSTOM_FIELD_NUMBER10": null,
      "CUSTOM_FIELD_NUMBER11": null,
      "CUSTOM_FIELD_NUMBER12": null,
      "CUSTOM_FIELD_NUMBER13": null,
      "CUSTOM_FIELD_NUMBER14": null,
      "CUSTOM_FIELD_NUMBER15": null,
      "CUSTOM_FIELD_NUMBER16": null,
      "CUSTOM_FIELD_NUMBER17": null,
      "CUSTOM_FIELD_NUMBER18": null,
      "CUSTOM_FIELD_NUMBER19": null,
      "CUSTOM_FIELD_NUMBER20": null,
      "SUB_LOCATION": null,
      "FINISH_DATE": null,
      "START_DATE": null,
      "EXPECT_END_DATE": null,
      "PERIOD": null,
      "DEPARTMENT_ID": null,
      "VIOLATION_ID": parseInt(this.ViolationId),
      "VIOLATION_GROUP_ID": parseInt(this.violationGroupId),
      "VIOLATION_VALUE": parseInt(this.violationValue),
      "ASSET_GROUP_ID": parseInt(this.AssetGroupId),
      "PARENT_ISSUE_ID": null,
      "CREATED_BY": null,
      "JOB_ORDER_ID": null
    }

    console.log(formValue.CUSTOM_FIELD_CHAR122)
    console.log(formValue.CUSTOM_FIELD_NUMBER7)
    for (var key in formValue) {
      console.log(key)
      for (var key2 in request) {
        if (key == key2) {
          if (key.toString().indexOf("DATE") != -1) {
            let date = new Date(formValue[key]);
            let latest_date = this.datepipe.transform(date, 'dd-MMM-yyyy');
            request[key2] = latest_date;
          }
          else {
            request[key2] = formValue[key];
          }
        }
      }
    }
    console.log("Final request");
    console.log(request);
    return request;
  }
  uploadIssueImage(issueId: string): Promise<any> {
    return this.nativHttp.uploadFile(`http://172.16.35.2:8002/attachements/insertnewfile`, { "ISSUE_ID": `${issueId}` }, null, this.photo, "myfile");

  }
  gitPhoto() {

    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {

      this.photo = imageData;
    }, (err) => {
      console.log(err)
    });

  }
  async getAssetDifinition(assetId: string) {
    this.runService("http://172.16.35.2:8002" + "/assetDefiniation/getOneAssetsDefinition/" + assetId, 'GET').then(response => {
      console.log(response);
      let responseData = JSON.parse(response.data);
      console.log('Json response', responseData);
      let responseDataArray = responseData.rows
      console.log('Json responseArray', responseDataArray);
      if (response != null && responseDataArray[0]) {
        console.log("Asset owner service data: " + responseData.rows);
        this.assetOwnerId = responseDataArray[0].ASSET_OWNER;
        console.log("Asset owner: " + this.assetOwnerId);
      } else {
        let loading1 = this.loadingCtrl.create({
          content: "somthing went wrong",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);
      }

    }, error => {
      console.log("Service failed1");
      console.log(error.status);
      if (error.status && error.status === 401) {
        // this.dialogsProvider.showAlertDialog('Error', 'Your session is expired, please login again');
        let loading1 = this.loadingCtrl.create({
          content: "Your session is expired, please login again",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);
      }
      else {
        // this.dialogsProvider.showAlertDialog('Error', 'Please check your internet connection');
        let loading1 = this.loadingCtrl.create({
          content: "Please check your internet connection",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);

      }
    });

  }

  getAssignmentRequest(issueId: string, employeeId: string) {
    let request = {
      "ISSUE_ID": parseInt(issueId),
      "ASSIGNMENT_STATUS": 12,
      "ASSIGNMENT_OPEN": 1,
      "ASSIGNMENT_COMMENTS": "test",
      "EMPLOYEE_ID": employeeId,
      "SUBSIDIARY_ID": 1
    };
    console.log("Assginment request");
    console.log(request);
    return request;
  }
  async getViolationIssues(violationId: string) {
    this.runService("http://172.16.35.2:8002" + "/compliance/getoneViolationIssue/" + violationId, 'GET').then(response => {
      console.log(response);
      let responseData = JSON.parse(response.data);
      console.log('Json response2', responseData);
      if (response != null && responseData.rows.length > 0) {
        console.log("Issues based on violation id: " + responseData.rows);
        this.violationIssues = responseData.rows;
        console.log(this.violationIssues);
      }

    }, error => {
      console.log("Service failed2");
      console.log(error);
      if (error.status === 401) {
        let loading1 = this.loadingCtrl.create({
          content: "Your session is expired, please login again",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);
      }
      else {
        let loading1 = this.loadingCtrl.create({
          content: "Please check your internet connection",
          spinner: "hide"
        });
        loading1.present()
        setTimeout(() => {
          loading1.dismiss();
        }, 2000);
      }
    });

  }
  getCreateViolationIssueRequest(requestId: string, formValue: any, empId: string, issue: ViolationIssue) {
    let request: any = {
      "REQUEST_ID": parseInt(requestId),
      "ISSUE_TITLE": issue.ISSU_TITLE,
      "ISSUE_SUMMARY": issue.ISSU_SUMMARY,
      "ISSUE_PRIORITY": 2,
      "ASSIGN_TO": issue.ASSIGN_TO,
      "TARGET_RESOLUTION_DATE": "19-mar-2019",
      "ACTUAL_RESOLUTION_DATE": null,
      "READ_STATUS": 1,
      "REFERENCE_ID": 6436,
      "REFERENCE_TYPE": 1,
      "ISSUE_TRACK_ID": null,
      "ISSUE_TYPE": null,
      "FINAL_RESOLUTION": "Test",
      "PROJECT_ID": null,
      "DELETED": 0,
      "DELETED_BY": null,
      "DELETED_DATE": null,
      "CREATED_WO": null,
      "SUBSIDIARY_ID": null,
      "CLASSIFICATION": 3,
      "CREATION_DATE": null,
      "TYPE_ID": issue.TYPE_ID,
      "ISSUE_SUB_CLASS": parseInt(this.issueSubClassId),
      "ISSUE_LOCATION": null,
      "SHIFT": null,
      "TOOL": null,
      "REQUIRE_REPORT": null,
      "ISSUE_STATE": null,
      "ISSUE_NOTE": null,
      "CUSTOM_FIELD_CHAR1": null,
      "CUSTOM_FIELD_CHAR2": null,
      "CUSTOM_FIELD_CHAR3": null,
      "CUSTOM_FIELD_CHAR4": null,
      "CUSTOM_FIELD_CHAR5": null,
      "CUSTOM_FIELD_NUMBER1": null,
      "CUSTOM_FIELD_NUMBER2": null,
      "CUSTOM_FIELD_NUMBER3": null,
      "CUSTOM_FIELD_NUMBER4": null,
      "CUSTOM_FIELD_NUMBER5": null,
      "CUSTOM_FIELD_DATE1": null,
      "CUSTOM_FIELD_DATE2": null,
      "CUSTOM_FIELD_DATE3": null,
      "CUSTOM_FIELD_DATE4": null,
      "CUSTOM_FIELD_DATE5": null,
      "CUSTOM_FIELD_LIST1": null,
      "CUSTOM_FIELD_CHAR6": null,
      "CUSTOM_FIELD_CHAR7": null,
      "CUSTOM_FIELD_CHAR8": null,
      "CUSTOM_FIELD_CHAR9": null,
      "CUSTOM_FIELD_CHAR10": null,
      "CUSTOM_FIELD_CHAR11": null,
      "CUSTOM_FIELD_CHAR16": null,
      "CUSTOM_FIELD_CHAR17": null,
      "CUSTOM_FIELD_CHAR12": null,
      "ASSEET_ID": parseInt(this.assetId),
      "ASSET_GROUP_ID": parseInt(this.AssetGroupId),
      "CUSTOM_FIELD_CHAR13": null,
      "CUSTOM_FIELD_CHAR14": null,
      "CUSTOM_FIELD_CHAR15": null,
      "CUSTOM_FIELD_CHAR18": null,
      "CUSTOM_FIELD_CHAR19": null,
      "EMPLOYEE_ID": parseInt(empId),
      "CUSTOM_FIELD_CHAR20": null,
      "PARENT_ISSUE_ID": null,
      "CUSTOM_FIELD_DATE9": null,
      "CUSTOM_FIELD_DATE11": null,
      "CUSTOM_FIELD_DATE12": null,
      "CUSTOM_FIELD_DATE13": null,
      "CUSTOM_FIELD_DATE14": null,
      "CUSTOM_FIELD_DATE15": null,
      "CUSTOM_FIELD_DATE16": null,
      "CUSTOM_FIELD_DATE17": null,
      "CUSTOM_FIELD_DATE18": null,
      "CUSTOM_FIELD_DATE19": null,
      "CUSTOM_FIELD_DATE20": null,
      "CUSTOM_FIELD_DATE10": null,
      "CUSTOM_FIELD_DATE6": null,
      "CUSTOM_FIELD_DATE7": null,
      "CUSTOM_FIELD_DATE8": null,
      "CUSTOM_FIELD_NUMBER6": null,
      "CUSTOM_FIELD_NUMBER7": null,
      "CUSTOM_FIELD_NUMBER8": null,
      "CUSTOM_FIELD_NUMBER9": null,
      "CUSTOM_FIELD_NUMBER10": null,
      "CUSTOM_FIELD_NUMBER11": null,
      "CUSTOM_FIELD_NUMBER12": null,
      "CUSTOM_FIELD_NUMBER13": null,
      "CUSTOM_FIELD_NUMBER14": null,
      "CUSTOM_FIELD_NUMBER15": null,
      "CUSTOM_FIELD_NUMBER16": null,
      "CUSTOM_FIELD_NUMBER17": null,
      "CUSTOM_FIELD_NUMBER18": null,
      "CUSTOM_FIELD_NUMBER19": null,
      "CUSTOM_FIELD_NUMBER20": null,
      "SUB_LOCATION": null,
      "FINISH_DATE": null,
      "START_DATE": null,
      "EXPECT_END_DATE": null,
      "PERIOD": null,
      "DEPARTMENT_ID": null,
      "VIOLATION_ID": parseInt(this.ViolationId),
      "VIOLATION_GROUP_ID": parseInt(this.violationGroupId),
      "VIOLATION_VALUE": parseInt(this.violationValue)
    };
    for (var key in formValue) {
      for (var key2 in request) {
        if (key == key2) {
          if (key.toString().indexOf("DATE") != -1) {
            let date = new Date(formValue[key]);
            let latest_date = this.datepipe.transform(date, 'dd-MMM-yyyy');
            request[key2] = latest_date;
          }
          else {
            request[key2] = formValue[key];
          }
        }
      }
    }
    console.log("Violation issue Final request");
    console.log(request);
    return request;
  }
  async createIssueForCompliance(issue: ViolationIssue, formValue: any) {
    try {
      let userData = await this.getData("UserBasicData");
      console.log("My data" + userData);
      let request = {
        "REQUEST_TYPE": 66,
        "DESCRIPTION": this.createIssueForm.value.title,
        "DELETED": 0,
        "SUBSIDIARY_ID": null,
        "CLASSIFICATION_ID": 11,
        "EMPLOYEE_ID": userData.EMPLOYEE_ID
      };
      let initWorkFlowResponse = await this.runService("http://85.194.99.134:9001/requests/newrequest", "POST", false, request);
      if (initWorkFlowResponse.data != null) {
        let responseData = JSON.parse(initWorkFlowResponse.data);
        console.log('Intialize work flow response', responseData);
        let finalRequest = this.getCreateViolationIssueRequest(responseData.rows.R_REQUEST_ID, formValue, userData.EMPLOYEE_ID, issue);
        console.log("Insert issue request");
        console.log(finalRequest);
        console.log(JSON.stringify(finalRequest));
        const response = await this.runService("http://85.194.99.134:8002" + "/issues/insertNewIssue", "POST", false, finalRequest);
        console.log(response);
        if (response.data != null) {
          let createIssueResponseData = JSON.parse(response.data);
          let issueId = createIssueResponseData.rows.R_ISSUE_ID;
          const assignIssueRequest = this.getAssignmentRequest(issueId, this.assetOwnerId);
          const assignIssueResponse = await this.runService("http://85.194.99.134:8002" + "/issues/insertNewIssueAssignments", "POST", false, assignIssueRequest);
          console.log("Assign issue response");
          console.log(assignIssueResponse.data);
          if (assignIssueResponse.data != null) {
            return true;
          }
          else {
            throw "Something wrong happened";
          }
        }
        else {
          throw "Something wrong happened";
        }
      }
      else {
        throw "Something wrong happened";
      }
    }
    catch (err) {
      throw err;
    }
  }

  constructor(public nav: NavController, public actionSheetCtrl: ActionSheetController, private camera: Camera, public navParams: NavParams, public loadingCtrl: LoadingController, public http: Http, public nativHttp: HTTP, public file: File, public storage: Storage, public datepipe: DatePipe, private DomSanitizer: DomSanitizer, private toastCtrl: ToastController, private nativePageTransitions: NativePageTransitions


  ) {
  }




}
interface ViolationIssue {
  VIOLATION_ISSUES_ID: number,
  VIOLATION_ID: number,
  ISSU_TITLE: string,
  ISSU_SUMMARY: string,
  ASSIGN_TO: number,
  WO_ID: number,
  TYPE_ID: number
}