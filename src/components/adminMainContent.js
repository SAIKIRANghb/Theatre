import Movies from './adminAddMovies';
import Theatres from './adminAddTheare';
import Screens from './adminAddScreen';
import Slots from './adminAddSlot';
import Users from './adminAddUser';
import WebPage from './adminAddWebPage';
export default function AdminMainContent() {
  return (
    <div id="admin-main-content">
    <div id="admin-page-container">
        <Movies />
        <Theatres />
        <Screens />
        <Slots />
        <Users />
        <WebPage />
    </div>
    </div>
  )
}
