// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import {Socket, LongPoller} from "phoenix"

class App {
  static init() {
    var username = $("#username");
    var msgBody  = $("#message");
    var messages = $("#messages");

    let socket = new Socket("/socket");
    socket.connect();
    socket.onClose( e => console.log("Closed connection") );
    socket.onOpen( ev => console.log("Opened connection", ev) );
    socket.onError( ev => console.log("ERROR", ev) );


    var channel = socket.channel("lobby:lobby", {});
    channel.join()
      .receive("ignore", () => console.log("auth error"))
      .receive("ok", () => console.log("join ok"))
      .receive("error", () => console.log("Connection error") );

    channel.onClose(e => console.log("channel closed", e));

    msgBody.off("keypress")
      .on("keypress", e => {
        if (e.keyCode == 13) {
          console.log(`[${username.val()}] ${msgBody.val()}`);
          channel.push("new:msg", {user: username.val(), body: msgBody.val()});
          msgBody.val("");
        }
      });

    channel.on("new:msg", msg => {
      messages.append(this.messageTemplate(msg));
      scrollTo(0, document.body.scrollHeight);
      console.log("received!", msg);
    });

    channel.on("user:entered", msg => {
      var username = this.sanitize(msg.user || "anonymous");
      messages.append(`<br/><i>[${username} entered]</i>`);
    });

    console.log("Initialized");
  }

  static sanitize(html){ return $("<div/>").text(html).html() }

  static messageTemplate(msg){
    let username = this.sanitize(msg.user || "anonymous")
    let body     = this.sanitize(msg.body)

    return(`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
  }
}

$( () => App.init() );