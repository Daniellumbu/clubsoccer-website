export interface School {
  name: string;
  logo: string;
  location: string;
}

export const HOME_LOCATION = "Carleton Fields, Northfield MN";

export const SCHOOLS: School[] = [
  { name: "Augsburg University",                           logo: "/colleges/Augsburg_University_wordmark.svg",                  location: "Augsburg University, Minneapolis MN" },
  { name: "Bemidji State University",                      logo: "/colleges/Bemidji_state_univ_logo.png",                       location: "Bemidji State University, Bemidji MN" },
  { name: "Bethel University",                             logo: "/colleges/Bethel_univ_logo_vert.png",                         location: "Bethel University, Arden Hills MN" },
  { name: "College of Saint Benedict / St. John's",        logo: "/colleges/St_benedict_and_st_john_univ_logo_stack.png",       location: "St. John's University, Collegeville MN" },
  { name: "College of St. Scholastica",                    logo: "/colleges/St-scholastica_logo_from_NCAA.svg",                 location: "College of St. Scholastica, Duluth MN" },
  { name: "Concordia College",                             logo: "/colleges/Concordia_logo.png",                                location: "Concordia College, Moorhead MN" },
  { name: "Crown College",                                 logo: "/colleges/Crown_college_logo.png",                            location: "Crown College, St. Bonifacius MN" },
  { name: "Gustavus Adolphus College",                     logo: "/colleges/Gustavus_adolphus_college_minn_logo.png",           location: "Gustavus Adolphus College, St. Peter MN" },
  { name: "Hamline University",                            logo: "/colleges/Hamline_U-Logo.svg",                                location: "Hamline University, St. Paul MN" },
  { name: "Macalester College",                            logo: "/colleges/Macalester_college_roundlogo.png",                  location: "Macalester College, St. Paul MN" },
  { name: "Martin Luther College",                         logo: "/colleges/MLC_Logo.png",                                      location: "Martin Luther College, New Ulm MN" },
  { name: "Minnesota State University Moorhead",           logo: "/colleges/Msum_university_logo.png",                          location: "MN State Moorhead, Moorhead MN" },
  { name: "North Central University",                      logo: "/colleges/North_central_univ_blue_textlogo.png",              location: "North Central University, Minneapolis MN" },
  { name: "Saint Mary's University of Minnesota",          logo: "/colleges/St_mary_univ_minnesota_logo.png",                   location: "Saint Mary's University, Winona MN" },
  { name: "St. Catherine University",                      logo: "/colleges/St_catherine_univ_ocupational_therapy_logo.png",    location: "St. Catherine University, St. Paul MN" },
  { name: "St. Cloud State University",                    logo: "/colleges/St._Cloud_State_University_logo.svg",               location: "St. Cloud State University, St. Cloud MN" },
  { name: "St. Olaf College",                              logo: "/colleges/St_olaf_college_minn_logo.svg",                     location: "St. Olaf College, Northfield MN" },
  { name: "University of Minnesota",                       logo: "/colleges/University_of_Minnesota_Logo.svg",                  location: "University of Minnesota, Minneapolis MN" },
  { name: "University of Minnesota Crookston",             logo: "/colleges/Minn_crookston_univ_logo.png",                      location: "UMN Crookston, Crookston MN" },
  { name: "University of Minnesota Duluth",                logo: "/colleges/Minn_duluth_monogram.png",                          location: "UMN Duluth, Duluth MN" },
  { name: "University of Minnesota Morris",                logo: "/colleges/Minn_morris_univ_logo.png",                         location: "UMN Morris, Morris MN" },
  { name: "University of Northwestern - St. Paul",         logo: "/colleges/Northwestern_univ_stpaul_logo.svg",                 location: "University of Northwestern, St. Paul MN" },
  { name: "Winona State University",                       logo: "/colleges/Winona_st_warriors_wordmark.png",                   location: "Winona State University, Winona MN" },
];

export function findSchool(opponent: string): School | undefined {
  return SCHOOLS.find((s) => s.name.toLowerCase() === opponent.toLowerCase());
}
