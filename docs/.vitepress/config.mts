import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "ProjectTrace",
  description: "Learn ProjectTrace, JMeter, k6, and Gatling in a simple path from app basics to performance testing.",
  base: "/projecttrace/",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "ProjectTrace", link: "/" },
      { text: "JMeter", link: "/05-jmeter-guide" },
      { text: "k6", link: "/04-k6-guide" },
      { text: "Gatling", link: "/10-gatling-guide" },
    ],
    sidebar: {
      "/": [
        {
          text: "ProjectTrace",
          items: [
            { text: "Home", link: "/" },
            { text: "What is ProjectTrace?", link: "/what-is-projecttrace" },
            { text: "Getting Started", link: "/01-setup" },
            { text: "Architecture", link: "/02-architecture" },
            { text: "API Guide", link: "/03-api-guide" },
            { text: "Manual Performance Checklist", link: "/11-manual-performance-checklist" },
            { text: "Users and Auth", link: "/workflows/users" },
            { text: "Projects", link: "/workflows/projects" },
            { text: "Planning Workflow", link: "/workflows/planning" },
            { text: "Testing Workflow", link: "/workflows/testing" },
            { text: "Bugs, Comments, Activity", link: "/workflows/bugs" },
            { text: "Activity Logs", link: "/workflows/activity" },
          ],
        },
        {
          text: "JMeter",
          items: [
            { text: "JMeter Guide", link: "/05-jmeter-guide" },
            { text: "Performance Test Types", link: "/09-performance-test-types" },
            { text: "Performance Baseline", link: "/06-performance-baseline" },
            { text: "Results Template", link: "/08-results-template" },
            { text: "Performance Roadmap", link: "/07-performance-bug-roadmap" },
          ],
        },
        {
          text: "k6",
          items: [
            { text: "k6 Guide", link: "/04-k6-guide" },
            { text: "Performance Test Types", link: "/09-performance-test-types" },
            { text: "Performance Baseline", link: "/06-performance-baseline" },
            { text: "Results Template", link: "/08-results-template" },
          ],
        },
        {
          text: "Gatling",
          items: [
            { text: "Gatling Guide", link: "/10-gatling-guide" },
            { text: "Performance Test Types", link: "/09-performance-test-types" },
            { text: "Performance Baseline", link: "/06-performance-baseline" },
            { text: "Results Template", link: "/08-results-template" },
          ],
        },
      ],
    },
  },
});
