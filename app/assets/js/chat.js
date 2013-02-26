var App = Em.Application.create()
  , socket = io.connect()
  , logInAudio = new Audio()
  , messageAudio = new Audio();

logInAudio.src = "http://www.flashkit.com/imagesvr_ce/flashkit/soundfx/Interfaces/Beeps/Electro_-S_Bainbr-7955/Electro_-S_Bainbr-7955_hifi.mp3"
logInAudio.autoload = true;

messageAudio.src = "http://www.flashkit.com/imagesvr_ce/flashkit/soundfx/Interfaces/Blips/Blip_1-Surround-7482/Blip_1-Surround-7482_hifi.mp3"
messageAudio.autoload = true;

var audioEvents = {
  login: function () {
    logInAudio.play();
  },
  message: function () {
    messageAudio.play();
  }
}

App.ApplicationRoute = Em.Route.extend({
  setupController: function (controller) {
    var self = this;

    var notify = function (event) {
      var controller = self.controllerFor('userInfo')
      if (controller.get('notifications')) {
        audioEvents[event].call();
      }
    };

    socket.on('user', function (user) {
      self.controllerFor('userInfo')
          .set('user', user);
    });

    socket.on('userList', function (users) {
      self.controllerFor('userList')
          .set('content', users);
    });

    socket.on('recentMessages', function (messages) {
      self.controllerFor('messages')
          .set('content', messages);

    });

    socket.on('newMessage', function (message) {
      notify('message');
      self.controllerFor('messages')
          .addObject(message);
    });

    socket.on('userJoined', function (message) {
      notify('login');
      self.controllerFor('messages')
          .addObject(message);
    });

  }
});

App.UserInfoController = Em.Controller.extend({

  notifications: false,

  userObserver: function () {
    var user = this.get('user');
    this.set('notifications', user.notifications);
  }.observes('user'),

  register: function (name) {
    if (name!=='') {
      socket.emit('setName', name);
      this.set('isEditing', false);
    }
  },

  isEditing: false,

  edit: function () {
    this.set('isEditing', true);
  },

  cancel: function () {
    socket.emit('getUser');
    this.set('isEditing', false);
  }

});

App.UserInfoView = Em.View.extend({
  focusOut: function (e) {
    this.get('controller')
        .send('cancel');
  }
});

App.UserInfoView.Notifications = Em.Checkbox.extend({
  click: function () {
    socket.emit('setNotifications', this.get('controller').get('notifications'));
  }
});


App.UserListController = Em.ArrayController.extend({
  content: Em.A()
});


App.MessagesController = Em.ArrayController.extend({
  content: Em.A(),
  sendMessage: function (message) {
    socket.emit('newMessage', message);
    this.set('message', '');
  },

  message: ''
});
