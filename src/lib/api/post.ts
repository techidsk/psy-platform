import { calculateHash, compressBlob } from '../logic/file';
import { getUrl } from '../url';

/**
 * 用于指示获取结果
 * - result：获取结果值。如果获取失败，它为undefined
 * - isFetchSuccess:是否按预期获得了结果。获取失败为false
 * - resultMsg：对应的结果消息，用于debug等。
 * - resultTransferCode：在fetch过程中得到的响应状态码。
 */
type FetchResult = {
    result: any;
    resultMsg: string;
    resultTransferCode: number;
    isFetchSuccess: boolean;
};

/**
 * 必须配合<input>使用的函数。一般绑定在input onChange 事件的绑定函数内触发。
 * 用于上传图片。
 *
 * 需要注意的是，如果希望有前端的内容提示响应，应该外嵌对应的事件绑定函数对返回结果进行处理
 *
 * @param e input onChange 传入的事件
 * @returns {FetchResult} 上传完毕后的获取结果。可通过判定isFetchSucess或result是否是undefined判断是否获取成功。
 */
export async function uploadPhotoWihInput(
    e: React.ChangeEvent<HTMLInputElement>
): Promise<FetchResult> {
    const targetFile = e.target.files?.[0];
    // 等待之后完成后端文件上传等后删除该段代码
    alert('因后端调整，暂时封存图像上传功能');

    // if (targetFile) {
    //     const hash = await calculateHash(targetFile);
    //     const checkFile = await fetch(getUrl(`/api/photo?hash=${hash}`));

    //     if (checkFile.ok) {
    //         // 文件已存在
    //         return {
    //             result: await checkFile.json(),
    //             resultMsg: 'File exists in the database',
    //             resultTransferCode: checkFile.status,
    //             isFetchSuccess: true,
    //         };
    //     }

    //     // 该接口404代码用于指示对应资源不存在在数据库内。好吧，我得承认这设计得很奇怪。
    //     if (checkFile.status !== 404) {
    //         return {
    //             result: checkFile.body,
    //             resultMsg: 'File exist in the database, so return its hash',
    //             resultTransferCode: checkFile.status,
    //             isFetchSuccess: true,
    //         };
    //     }

    //     const { compressedBlob, fileOriginType } = await compressBlob(targetFile);

    //     const formData = new FormData();
    //     formData.append('data', compressedBlob);
    //     formData.append('compressedType', 'gzip');
    //     formData.append('dataType', fileOriginType);
    //     formData.append('hash', hash);

    //     const response = await fetch(getUrl('/api/photo'), {
    //         method: 'POST',
    //         body: formData,
    //     });

    //     if (!response.ok) {
    //         // 处理上传错误
    //         return {
    //             result: undefined,
    //             resultMsg: 'Error uploading file',
    //             resultTransferCode: response.status,
    //             isFetchSuccess: false,
    //         };
    //     }

    //     // 上传成功
    //     return {
    //         result: await response.json(),
    //         resultMsg: 'Success',
    //         resultTransferCode: response.status,
    //         isFetchSuccess: true,
    //     };
    // }

    return {
        result: undefined,
        resultMsg: '传入文件为空',
        resultTransferCode: 500,
        isFetchSuccess: false,
    };
}

/**
 * 通过传入File对象上传文件
 * @param file
 */
export async function uploadPhotoWithFile(targetFile: File): Promise<FetchResult> {
    if (targetFile) {
        const hash = await calculateHash(targetFile);

        const checkFile = await fetch(getUrl(`/api/photo?hash=${hash}`), {
            method: 'GET',
        });

        // 该接口404代码用于指示对应资源不存在在数据库内。好吧，我得承认这设计得很奇怪。
        if (checkFile.status != 404) {
            // 不等于404说明文件已经存放在数据库内，因此将返回的寻访URL返回，可通过该URL借助/api/psy 接口获取相应资源
            return {
                result: await checkFile.text(),
                resultMsg: 'File exist in the database,so return its hash',
                resultTransferCode: checkFile.status,
                isFetchSuccess: true,
            };
        }

        const compressResult = await compressBlob(targetFile);

        const formData = new FormData();

        formData.append('data', compressResult.compressedBlob);
        formData.append('compressedType', 'gzip');
        formData.append('dataType', compressResult.fileOriginType);
        formData.append('hash', hash);

        const response = await fetch(getUrl('/api/photo'), {
            method: 'POST',
            body: formData,
        });

        if (response.status == 401) {
            return {
                result: undefined,
                resultMsg: 'Illegal requese.请求非法。',
                resultTransferCode: response.status,
                isFetchSuccess: false,
            };
        }

        return {
            result: await response.json(),
            resultMsg: 'Success',
            resultTransferCode: response.status,
            isFetchSuccess: true,
        };
    }

    return {
        result: undefined,
        resultMsg: '传入文件为空',
        resultTransferCode: 500,
        isFetchSuccess: false,
    };
}
