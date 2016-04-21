//Preloader
var style = document.createElement("style");
style.textContent = "" + "body {" + "background-color: #303030; margin: 0 auto; width: 100vw; height: 100vh;" + " } \n" + "#pre_loader{" + "margin: 0 auto; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; transition: opacity ease-in 0.2s;" + " }";
var head = document.querySelector("head");
head.insertBefore(style, head.firstChild);

var pre_loader = document.createElement("div");
pre_loader.id = "pre_loader";
var loading_icon = document.createElement("div");
loading_icon.innerHTML = "<img src='images/touch/preloader.png'>";
pre_loader.appendChild(loading_icon);
document.body.appendChild(pre_loader);

/* WebComponentsReady */

window.addEventListener('WebComponentsReady', function(e) {
  pre_loader.style.display = "none";
  var app = document.getElementById("app");
  app.username = location.host.split(".")[0];
  app.project = document.title.split(" | ")[0];

  firebase_element = document.getElementById('firebaseAuth');
  firebase_element.addEventListener('login', function (e) {

    app.provider = app.signed_user.provider;
    if(app.provider == "github"){
      user_input = app.signed_user.github.username;
      token_input = app.signed_user.github.accessToken;
      github = new Github({
        username: user_input,
        password: token_input,
        auth: "basic"
      });
    }
    if(app.provider == "anonymous"){
      app.signed_user = e.target.user.uid;
      document.getElementById('sign_in_dialog').close();
    }
    document.getElementById('sign_in_spinner').active = false;
    document.getElementById("sign_in_success_toast").open();
  });

  firebase_element.addEventListener('authenticated', function (e) { //On error
    if(app.signed_user == null){
      document.getElementById('sign_in_dialog').open();
    }
  });
});
function iframe_ready() {
  document.getElementById('app_iframe').style.opacity = 1;
  document.getElementById('iframe_loading_spinner').active = false;

  var iframe_document = document.getElementById('app_iframe').contentDocument || document.getElementById('app_iframe').contentWindow.document;
  var app_content = iframe_document.getElementById('app_content');
  if(app_content.children.length > 0){
    app_content.selected = app_content.children[0].id;
  }
}

function sign_in(provider) {
  document.getElementById('sign_in_spinner').active = true;
  app.provider = provider;
  firebase_element.login();
}
function sign_out() {
  firebase_element.logout();
}

function promptIssueDialog() {
  document.getElementById('add_issue_dialog').open();
}

function createIssue() {
  var title_validated = document.getElementById("add_issue_input").validate();
  var body_validated = document.getElementById("add_issue_body_input").validate();
  if(!title_validated || !body_validated){
    return;
  }
  document.getElementById("add_issue_spinner").active = true;
  if(app.provider == "github"){
    var issues = github.getIssues(app.username, "polytipe-projects");
    var options = {
      title: app.issue_title,
      body: app.issue_body,
      labels: [
        app.project
      ]
    };

    issues.create(options, function(err, issue) {
      if(err){
        document.getElementById("issue_fail_toast").open();
      }
      document.getElementById("add_issue_spinner").active = false;
      document.getElementById('add_issue_dialog').close();
      document.getElementById("issue_success_toast").open();
    });
  }
  if(app.provider == "anonymous"){
    console.log("Nothing here yet");
    document.getElementById("add_issue_spinner").active = false;
    document.getElementById("issue_fail_toast").open();
  }
}
