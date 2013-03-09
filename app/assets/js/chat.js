var App = Em.Application.create()
  , socket = io.connect();

var Notifier = function (router) {
  var controller = router.controllerFor('userInfo');

  var audioSrc = {
    login: "http://www.flashkit.com/imagesvr_ce/flashkit/soundfx/Interfaces/Beeps/Electro_-S_Bainbr-7955/Electro_-S_Bainbr-7955_hifi.mp3"
    , message: "http://www.flashkit.com/imagesvr_ce/flashkit/soundfx/Interfaces/Blips/Blip_1-Surround-7482/Blip_1-Surround-7482_hifi.mp3"
  };

  var audios = {};

  function AudioFactory(name) {
    var audio = audios[name] || (audios[name] = new Audio(audioSrc[name]));
    audio.play();
  };

  return function (event) {
    if (controller.get('notifications')) {
      AudioFactory(event);
    }
  };
}

App.Router.reopen({
  location: 'none'
});

App.ApplicationRoute = Em.Route.extend({
  setupController: function (controller) {
    var self = this
      , notify = new Notifier(self);

    socket.on('user', function (user) {
      self.controllerFor('userInfo').set('user', user);
    });

    socket.on('userList', function (users) {
      self.controllerFor('userList').set('content', users);
    });

    socket.on('recentMessages', function (messages) {
      self.controllerFor('messages').set('content', messages);
    });

    socket.on('newMessage', function (message) {
      notify('message');
      self.controllerFor('messages').addObject(message);
      Ember.run.later(function () {
        $('#messages-feed').scrollTop($('#messages-feed')[0].scrollHeight);
      },100);
    });

    socket.on('userJoined', function (message) {
      notify('login');
      self.controllerFor('messages').addObject(message);
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
      socket.emit('update', {name: name});
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
    var notifications = this.get('controller').get('notifications');
    socket.emit('update', { notifications: notifications });
  }
});


App.UserListController = Em.ArrayController.extend({
  content: Em.A(),
  sortProperties: ['status', 'name'],
  sortAscending: false,
  itemController: 'user'
});

App.UserController = Em.ObjectController.extend({});

App.MessagesController = Em.ArrayController.extend({
  content: Em.A(),

  itemController: 'message',

  sendMessage: function (message) {
    socket.emit('newMessage', message);
    this.set('message', '');
  },

  message: ''
});

App.MessageController = Em.ObjectController.extend({
  formattedTime: function () {
    var timeString = this.get('time');
    if (timeString !== undefined) {
      return new XDate(timeString).toString('HH:mm');
    } else { return '' }
  }.property('time')
});

App.MessagesView = Em.View.extend({
});
