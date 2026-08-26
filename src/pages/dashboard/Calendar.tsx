import CalendarSignificanceMarkers from "../../components/scheduling/CalendarSignificanceMarkers";
import HlcNativeCalendar from "./HlcNativeCalendar";

export default function Calendar() {
  return <>
    <HlcNativeCalendar />
    <CalendarSignificanceMarkers />
  </>;
}
