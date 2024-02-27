import { extractKeyword, extractYoutubeVideoData } from "../lib/utils";

describe('find youtube videoId', () => {
  test.each([
    ['https://www.youtube.com/watch?v=74yRsfR2Lgo&list=RDGMEMHDXYb1_DDSgDsobPsOFxpAVMMPCf4bRFCvs&index=11', { videoId: '74yRsfR2Lgo' }],
    ['https://www.youtube.com/shorts/qjx6YRCgDFQ', { videoId: 'qjx6YRCgDFQ' }],
    ['https://youtube.com/shorts/qjx6YRCgDFQ?si=em2ghK-05xOuSHbu', { videoId: 'qjx6YRCgDFQ' }],
    ['https://youtu.be/74yRsfR2Lgo?si=KBkrqn1p3bv_Rzhf', { videoId: '74yRsfR2Lgo' }],
    ['https://youtu.be/74yRsfR2LgoqEQ2?si=KBkrqn1p3bv_Rzhf', { videoId: '74yRsfR2Lgo' }],
    ['https://www.youtube.com/watch?v=_yKMZVja1Ek&t=918s', { videoId: '_yKMZVja1Ek', timing: 918 }],
    ['https://youtu.be/_xuHm33I1y0?si=4x_wJL7-Qz8A1p_X&t=57', { videoId: '_xuHm33I1y0', timing: 57 }],
    ['https://www.youtube.com/watch?v=HLZOg4ohBug&t=17846s', { videoId: 'HLZOg4ohBug', timing: 17846 }],
    ['https://youtu.be/l8MBFaFVZbk?si=_DYdkNtI2pWKc6vC&t=324', { videoId: 'l8MBFaFVZbk', timing: 324 }],
  ])('[%s] should return -> [%s]', (link, videoId) => {
    expect(extractYoutubeVideoData(link)).toStrictEqual(videoId);
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
    expect(extractKeyword(input, [keepKeyword, skipKeyword])).toBe(output);
  });
});