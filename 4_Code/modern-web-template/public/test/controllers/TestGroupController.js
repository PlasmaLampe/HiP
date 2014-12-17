/**
 * Created by jorgamelunxen on 12.12.14.
 */

var demoGroup = {
    uID: "1",
    name: "Dummy",
    member: "someOne",
    createdBy: "Tester",
    topic: "someTopic",
    subtopics: "test",
    notifications: [""],
    readableBy: ["user1","group3"]
};

var demoGroup2 = {
    uID: "2",
    name: "AnotherDummy",
    member: "someOne",
    createdBy: "Tester",
    topic: "someTopicAgain",
    subtopics: "test",
    notifications: [""],
    readableBy: ["user2"]
};

var demoGroup3 = {
    uID: "group3",
    name: "AnotherDummy",
    member: "user3",
    createdBy: "Tester",
    topic: "someTopicAgain",
    subtopics: "test",
    notifications: [""],
    readableBy: ["user3"]
};

var demoUser = {
    userid:     'someOne@someting.com',
    email:      'someOne@someting.com',
    firstname:  "John",
    lastname:   "Doe",
    avatar:     "gravatarAddress"
};

describe('Testsuite for the GroupController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var gc = {};
    var routeParams = {};
    routeParams.uID = 1;

    beforeEach(function () {
        module('myApp.groups');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        $httpBackend.when('GET','/admin/group/1')
            .respond(200,[demoGroup]);

        $httpBackend.when('GET','/admin/groups')
            .respond(200,[demoGroup, demoGroup2, demoGroup3]);

        $httpBackend.when('GET','/admin/topic/someTopic')
            .respond(200,[{}]);

        $httpBackend.when('GET','/admin/users/someOne')
            .respond(200,[demoUser]);

        $httpBackend.when('POST','/admin/constraints')
            .respond(200,{});

        $httpBackend.when('POST','/admin/topic')
            .respond(200,{});

        /* -------
         FIXME: small hack
         * -------*/
        $httpBackend.when('GET','/admin/users/someOneundefined')
            .respond(200,[demoUser]);
        /* --------- */

        /* Mock for user controller */
        var uc = {
          email: "Tester"
        };

        /* Mock for group controller */
        gc.setTopicAtGroup = function(){};
        gc.createNotificationAtGroup = function(){};
        gc.createNotificationAtGroupAndSetTopic = function(){};

        /* Included mocked user controller and group controller in scope */
        $scope = {
            uc: uc,
            gc: gc
        };

        /* create controller */
        controller = $controller('GroupCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        /* reset test data */
        demoGroup = {
            uID: "1",
            name: "Dummy",
            member: "someOne",
            createdBy: "Tester",
            topic: "someTopic",
            subtopics: "test",
            notifications: [""],
            readableBy: ["user1","group3"]
        };

        demoGroup2 = {
            uID: "2",
            name: "AnotherDummy",
            member: "someOne",
            createdBy: "Tester",
            topic: "someTopicAgain",
            subtopics: "test",
            notifications: [""],
            readableBy: ["user2"]
        };

        demoGroup3 = {
            uID: "group3",
            name: "AnotherDummy",
            member: "user3",
            createdBy: "Tester",
            topic: "someTopicAgain",
            subtopics: "test",
            notifications: [""],
            readableBy: ["user3"]
        };

        demoUser = {
            userid:     'someOne',
            email:      'someOne@someting.com',
            firstname:  "John",
            lastname:   "Doe",
            avatar:     "gravatarAddress"
        };
    });

    function initController() {
        /* all needed calls are handled via $httpBackend.when(...) */
        $httpBackend.flush();

        var nameOfTheDetailedGroupFetchedViaUID = controller.bufferedGroup.name;
        expect(nameOfTheDetailedGroupFetchedViaUID).toBe("Dummy");

        var lengthOfTheArrayForStoredGroups = controller.groups.length;
        expect(lengthOfTheArrayForStoredGroups).toBe(3);

        var nameOfTheUserFetchedViaUID = controller.userInGroupArray[0].firstname;
        expect(nameOfTheUserFetchedViaUID).toBe("John");
    }

    it('fetches the needed Groups for the currently logged in user on startup and' +
        'the needed details about Group 1 because uID=1 within the routeParams', function(){
        initController();
    });

    it('sets a topic at a group with the setTopicAtGroup function', function(){
        initController();

        controller.setTopicAtGroup('1','topicID');

        /* call handled directly  - see above -
        $httpBackend.expectGET('/admin/group/1') */

        var changedGroup = demoGroup;
        changedGroup.topic = 'topicID';

        $httpBackend.expectPOST('/admin/modify/group',changedGroup)
            .respond('200',{});

        $httpBackend.flush();
    });

    it('creates a new notification at a grp with the createNotification function', function(){
        initController();

        controller.createNotificationAtGroup('1','system_notification_groupCreated',['dummy']);

        var now = new Date();
        var notification = {
            groupID : '1',
            notification: 'system_notification_groupCreated,dummy ('+now.toLocaleString()+')'
        };

        $httpBackend.expectPOST('/admin/notification',notification)
            .respond('200',{});

        $httpBackend.flush();
    });

    it('creates a new group with the createGroup function', function(){
        initController();

        spyOn(gc,'createNotificationAtGroupAndSetTopic');

        /* prepare controller */
        controller.userInGroupArray = ["dummy"];
        controller.currentGroup = demoGroup;

        var currentGroupTopic = {
            topic: "bla",
            subtopics: "..."
        };

        controller.currentGroupTopic = currentGroupTopic;

        /* create group */
        controller.createGroup('creator','John');

        expect(gc.createNotificationAtGroupAndSetTopic).toHaveBeenCalled();

        $httpBackend.expectPOST('/admin/group',demoGroup).respond(200,{});

        /* expect the creation of the chat */
        var expectedChat = {
            uID     : demoGroup.uID,
            name    : demoGroup.name + " Chat",
            message : [""],
            sender  : [""]
        };

        $httpBackend.expectPOST('/admin/chat/true',expectedChat).respond(200,{});

        $httpBackend.flush();
    });

    it('is able to grant read rights for a group within the current group', function () {
        initController();

        controller.setReadRightWithinCurrentGroupForAnotherGroup("testUID");

        $httpBackend.expectPOST('/admin/readRight/1/testUID').respond(200,{});
        $httpBackend.flush();
    });

    it('deletes a group with the deleteGroup function', function(){
        initController();

        controller.deleteGroup('1');

        $httpBackend.expectDELETE('/admin/group/1').respond('200',{});
        $httpBackend.expectDELETE('/admin/chat/1').respond('200',{});

        $httpBackend.flush();
    });

    it('is able to check if a given user is member of given group', function () {
        initController();

        var returnValue = controller.userIDIsMemberOfGrp('someOne','1');

        expect(returnValue).toBe(true);
    });

    it('is able to check if a given user is not a member of a given group', function () {
        initController();

        var returnValue = controller.userIDIsMemberOfGrp('someOne2','1');

        expect(returnValue).toBe(false);
    });

    it('is able to check if a given user has read rights for a given group', function () {
        initController();

        var returnValue = controller.userIDIsReaderOfGrp('user1','1');

        expect(returnValue).toBe(true);
    });

    it('is able to check if a given user has no read rights for a given group', function () {
        initController();

        var returnValue = controller.userIDIsReaderOfGrp('user2','1');

        expect(returnValue).toBe(false);
    });

    it('is able to get the read-access right even when the user is only in another group that ' +
        'has the right', function () {
        initController();

        var returnValue = controller.userIDIsReaderOfGrp('user3','1');

        expect(returnValue).toBe(true);
    });
});