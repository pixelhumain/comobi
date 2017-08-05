/* let count = 0;
const cursor = Meteor.users.find({ 'profile.online': true });
const handle = cursor.observeChanges({
  added(id, user) {
    count += 1;
    console.log(`${user.name} brings the total to ${count} online.`);
  },
  removed() {
    count -= 1;
    console.log(`Lost one. We're now down to ${count} online.`);
  }
});
// After five seconds, stop keeping the count.
setTimeout(() => handle.stop(), 5000); */
