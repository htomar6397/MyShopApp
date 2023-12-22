export function formatAMPM(x) {
  var date = new Date(x);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime =
    "....... " +
    date.toString().split(" ")[0] +
    " ........ " +
    date.toString().split(" ")[1] +
    " " +
    date.toString().split(" ")[2] +
    " " +
    date.toString().split(" ")[3] +
    " ........ " +
    hours +
    ":" +
    minutes +
    " " +
    ampm;

  return strTime;
}
