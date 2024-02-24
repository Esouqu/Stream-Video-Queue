import { findKeyword, findYoutubeVideoId } from "../lib/utils";

describe('find youtube videoId', () => {
  test.each([
    ['https://www.youtube.com/watch?v=74yRsfR2Lgo&list=RDGMEMHDXYb1_DDSgDsobPsOFxpAVMMPCf4bRFCvs&index=11', '74yRsfR2Lgo'],
    ['https://www.youtube.com/shorts/qjx6YRCgDFQ', 'qjx6YRCgDFQ'],
    ['https://youtube.com/shorts/qjx6YRCgDFQ?si=em2ghK-05xOuSHbu', 'qjx6YRCgDFQ'],
    ['https://youtu.be/74yRsfR2Lgo?si=KBkrqn1p3bv_Rzhf', '74yRsfR2Lgo'],
    ['https://www.youtube.com/watch?v=_yKMZVja1Ek&t=918s', '_yKMZVja1Ek']
  ])('[%s] should return -> [%s]', (link, videoId) => {
    expect(findYoutubeVideoId(link)).toBe(videoId);
  });
});

describe('find keywords', () => {
  const keepKeyword = 'Оставить';
  const skipKeyword = 'Скип';

  test.each([
    ['Скип', skipKeyword],
    ['скип', skipKeyword],
    ['скип оставить', skipKeyword],
    ['Оставить', keepKeyword],
    ['оставить', keepKeyword],
    ['надо оставить скип', keepKeyword],
    ['скипоставить', undefined],
    ['оставитьскип', undefined],
    ['Скипнем?', undefined],
    ['СкипСкипСкипСкип', undefined],
    ['Приветскипнейм', undefined],
  ])('[%s] should return -> [%s]', (input, output) => {
    expect(findKeyword(input, [keepKeyword, skipKeyword])).toBe(output);
  });
});